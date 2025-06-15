// Netlify serverless function for parsing OCR text using GPT-3.5 Turbo
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt to guide GPT-3.5's parsing
const SYSTEM_PROMPT = `You are a smart receipt parser that converts raw OCR receipt text into clean structured JSON.

⚠️ CRITICAL: ONLY USE VALUES FROM THE ACTUAL RECEIPT
- Do not use any values from examples
- Do not make up any values
- Do not reuse values from previous receipts
- If you can't find a value in the receipt, use 0 or empty string

Follow these strict parsing rules:

1. Vendor Information:
   - Extract actual business name from receipt header
   - Extract actual receipt date (in YYYY-MM-DD format)
   - Extract actual GST/registration number if present

2. Item Handling - CRITICAL RULES:
   You MUST extract every receipt line that includes:
   - Regular items with prices
   - Items with quantities
   - Items with discounts
   - $0.00 items and modifiers
   
   For each item:
   ✓ Use the exact printed order from receipt
   ✓ Keep items with quantities as single entries
   ✓ Never split or duplicate items
   ✓ Combine item + discount lines

   Examples:
   Receipt line → JSON output
   "3 CircuitBreaker (P) $54.00" → name: "3 CircuitBreaker (P)", price: 54.00
   "Chain Reaction (P) $18.00" + "15% HH Discount" → name: "Chain Reaction (P) (-15% HH discount)", price: 15.30
   "7 Stolichnaya Gls $105.00 $15.00 each" → name: "7 Stolichnaya Gls", price: 105.00
   "Red Base $0.00" → name: "Red Base", price: 0.00

   For each item line:
   a) First, identify the item pattern:
      - Single item: "Chain Reaction (P) $18.00" or "Meat Lovers Pizza $24.00" -> Include as is
      - Item with quantity: "3 CircuitBreaker (P) $54.00" -> Keep as ONE item with full price
      - Item with quantity and price each: "7 Stolichnaya Gls $105.00 $15.00 each" -> Keep as ONE item with total price
      - Item with discount: Include discount in name like "Chain Reaction (P) (-15% HH discount)"
      - Zero-price items: "Red Base $0.00" -> Include these too!

   b) Then for each item create:
      - name: Include quantity in name if present (e.g. "3 CircuitBreaker (P)")
      - price: Always use total price (after quantity and discounts)
3. Prices:
   - Numbers should be without currency symbols
   - Handle "each" prices by multiplying by quantity
   - Apply item-specific discounts before adding to subtotal
4. Use standard currency codes (USD, SGD, etc.)
5. Format dates as YYYY-MM-DD
6. Totals and Tax:
   - Find subtotal (typically labeled as "Subtotal:")
   - Look for GST/Tax line (e.g., "9% GST:" or similar)
   - Find service charge (typically "10% Service Charge")
   - Calculate: total = subtotal + tax + service_charge + other_charge - general_discount
   
   IMPORTANT: Extract actual values from receipt:
   - For tax: Look for line with "GST" and get exact amount after "$"
   - For service charge: Look for line with "Service Charge" and get exact amount
   - For subtotal: Look for line with "Subtotal:" and get exact amount
   DO NOT use these example values:
   "Subtotal: $100.00" → subtotal: 100.00
   "9% GST: $7.00" → tax: 7.00
   "Service Charge $10.00" → service_charge: 10.00
7. Return valid JSON matching the specified structure`;

// Example format to demonstrate to GPT - DO NOT USE THESE VALUES, extract actual values from receipt
const FORMAT_EXAMPLE = {
  vendor_name: "",  // Extract from receipt header
  date: "",        // Format as YYYY-MM-DD
  currency: "",    // Usually "SGD" for Singapore receipts
  items: [
    // Extract ALL items from receipt in exact order
    // DO NOT copy these examples - they are just to show the structure
    {
      name: "Item Name",  // Include any discounts or quantities in name
      price: 0.00        // Price after any discounts
    }
  ],
  subtotal: 0.00,        // Extract from "Subtotal:" line
  tax: 0.00,            // Extract from "GST:" line
  service_charge: 0.00,  // Extract from "Service Charge" line
  other_charge: 0.00,    // Any additional charges
  general_discount: 0.00, // Any overall discount
  total: 0.00           // Final total from receipt
};

// Validate parsed data structure and calculations
function validateParsedData(data) {
  const requiredFields = [
    'vendor_name', 'date', 'currency', 'items',
    'subtotal', 'tax', 'service_charge', 'other_charge', 'general_discount', 'total'
  ];

  console.log('Starting data validation for:', data);

  // Initialize missing fields with defaults
  const defaults = {
    vendor_name: 'Unknown',
    date: new Date().toISOString().split('T')[0],
    currency: 'SGD',
    items: [],
    subtotal: 0,
    tax: 0,
    service_charge: 0,
    other_charge: 0,
    general_discount: 0,
    total: 0
  };

  // Fill in any missing fields with defaults
  for (const field of requiredFields) {
    if (!(field in data)) {
      console.warn(`Missing field '${field}', using default:`, defaults[field]);
      data[field] = defaults[field];
    }
  }

  // Ensure items is an array
  if (!Array.isArray(data.items)) {
    console.warn('Items is not an array, initializing as empty array');
    data.items = [];
  }
  
  // Validate each item and calculate real subtotal
  let calculatedSubtotal = 0;
  for (const item of data.items) {
    if (!item.name || typeof item.price !== 'number') {
      throw new Error('Invalid item structure');
    }
    calculatedSubtotal += item.price;
  }

  // Round to 2 decimal places for comparison
  calculatedSubtotal = Math.round(calculatedSubtotal * 100) / 100;
  
  // Verify subtotal matches sum of items
  if (Math.abs(calculatedSubtotal - data.subtotal) > 0.01) {
    console.warn(`Subtotal mismatch: calculated=${calculatedSubtotal}, provided=${data.subtotal}`);
    data.subtotal = calculatedSubtotal;
  }

  // Convert all amounts to numbers and handle null values
  const numbers = ['subtotal', 'tax', 'service_charge', 'other_charge', 'general_discount', 'total'];
  numbers.forEach(field => {
    data[field] = data[field] === null ? 0 : Number(data[field]);
  });

  // Validate date format
  if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    throw new Error('Invalid date format');
  }

  // Calculate and verify total
  const calculatedTotal = (
    data.subtotal +
    data.tax +
    data.service_charge +
    data.other_charge -
    data.general_discount
  ).toFixed(2);

  const providedTotal = data.total.toFixed(2);

  if (calculatedTotal !== providedTotal) {
    console.warn(`Total mismatch: calculated=${calculatedTotal}, provided=${providedTotal}`);
    // Update total to match calculation
    data.total = Number(calculatedTotal);
  }

  return data;
}

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    console.log('Received request body:', event.body);
    
    // Parse request body
    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
      console.log('Parsed request body:', parsedBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      throw new Error('Invalid JSON in request body');
    }

    const { text } = parsedBody;
    if (!text) {
      console.error('No text field in parsed body:', parsedBody);
      throw new Error('No OCR text provided');
    }

    console.log('Attempting to parse OCR text:', text);

    // Additional preprocessing before sending to GPT
    const lines = text.split('\n').filter(line => line.trim()); // Remove empty lines
    
    // Process lines to combine items with their discounts
    const processedLines = [];
    let currentItem = null;
    
    for (const line of lines) {
      // Skip empty or numeric-only lines
      if (!line.trim() || /^\d+(\.\d{2})?$/.test(line)) continue;

      if (line.toLowerCase().includes('subtotal:')) {
        processedLines.push(line);
        currentItem = null;
      } else if (line.toLowerCase().includes('gst:')) {
        processedLines.push(line);
        currentItem = null;
      } else if (line.toLowerCase().includes('service charge')) {
        processedLines.push(line);
        currentItem = null;
      } else if (line.toLowerCase().includes('discount:')) {
        if (currentItem) {
          const matches = line.match(/(\d+)%/); // Extract discount percentage
          if (matches) {
            const percentage = matches[1];
            // Extract the item name without the price
            const itemParts = currentItem.split('$');
            if (itemParts.length > 1) {
              const itemName = itemParts[0].trim();
              const price = parseFloat(itemParts[1].trim());
              const discountMatch = line.match(/\$(\d+\.\d{2})/);
              const discountAmount = discountMatch ? parseFloat(discountMatch[1]) : 0;
              const finalPrice = price - discountAmount;
              currentItem = `${itemName} $${finalPrice.toFixed(2)} (-${percentage}% HH discount)`;
            }
          }
        }
      } else if (line.match(/\$\d+\.\d{2}/)) { // Line contains a price
        if (currentItem) {
          processedLines.push(currentItem);
        }
        // Try to separate item name from price
        const parts = line.split('$');
        if (parts.length === 2 && parts[0].trim()) {
          currentItem = `${parts[0].trim()} $${parseFloat(parts[1]).toFixed(2)}`;
        } else {
          currentItem = line;
        }
      } else {
        // Must be additional info for current item
        if (currentItem) {
          currentItem += ' ' + line;
        }
      }
    }
    
    // Add the last item if exists
    if (currentItem) {
      processedLines.push(currentItem);
    }
    
    console.log('Preprocessed lines:', processedLines);

    // Clean up the text before sending to GPT
    const cleanedText = processedLines.join('\n')
                           .replace(/[^\x20-\x7E\n]/g, '') // Remove non-ASCII characters
                           .replace(/\$/g, 'SGD ');
    
    console.log('Cleaned text before sending to GPT:', cleanedText);
    console.log('Text length:', cleanedText.length);

    console.log('About to call GPT with text:', cleanedText);

    // Call GPT to parse the receipt
    console.log('Using OpenAI model: gpt-4o-mini');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Switched to GPT-4o-mini for lower cost and improved performance on text tasks
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: `You are reading raw OCR text from a restaurant receipt.

⚠️ IMPORTANT: 
- ONLY use values from the provided receipt text
- DO NOT copy any values from the format example
- DO NOT reuse values from other receipts
- If a value isn't in the receipt, use 0 or empty string

Your task:
1. Parse ALL items exactly as they appear in THIS receipt
2. Use the ACTUAL vendor name from THIS receipt
3. Use the ACTUAL date from THIS receipt
4. Extract ACTUAL tax and service charge from THIS receipt
5. Calculate totals using values from THIS receipt only

Receipt text:
${cleanedText}

Return ONLY valid JSON matching this format exactly:
${JSON.stringify(FORMAT_EXAMPLE, null, 2)}`
        }
      ],
      temperature: 0, // Use 0 for more deterministic output
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    // Log the raw GPT response
    if (!completion?.choices?.[0]?.message) {
      console.error('Unexpected GPT response structure:', completion);
      throw new Error('Invalid response structure from GPT');
    }

    console.log('GPT Response:', completion.choices[0].message);

    const gptResponse = completion.choices[0].message.content;
    console.log('GPT Content:', gptResponse);

    // Ensure we have a response
    if (!gptResponse) {
      throw new Error('Empty response from GPT');
    }

    let parsedData;
    try {
      console.log('Attempting to parse GPT response as JSON');
      parsedData = JSON.parse(gptResponse);
      console.log('Successfully parsed JSON:', parsedData);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response that failed to parse:', gptResponse);
      throw new Error(`Failed to parse GPT response: ${parseError.message}`);
    }

    // Validate and normalize the data
    const validatedData = validateParsedData(parsedData);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    };

  } catch (error) {
    console.error('Parse OCR Error:', error);

    // Handle different types of errors
    let statusCode = 500;
    let errorMessage = 'Failed to parse receipt';
    let details = error.message;

    if (error.name === 'ValidationError') {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.response?.status === 429) {
      statusCode = 429;
      errorMessage = 'Too many requests, please try again later';
    }

    // Log detailed error information
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      status: error.response?.status,
      stack: error.stack,
    });

    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? details : undefined
      }),
    };
  }
};
