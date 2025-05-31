// Netlify serverless function for parsing OCR text using GPT-3.5 Turbo
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt to guide GPT-3.5's parsing
const SYSTEM_PROMPT = `You are a receipt parsing assistant. Extract structured information from OCR text of restaurant receipts.
Follow these rules strictly:
1. Extract all factual information present in the receipt
2. For items:
   - Remove item numbers/codes
   - Clean up description to be human-readable
   - Keep all pricing markings (P) in the name
   - Include all items with prices, even $0.00 items
   - If an item has "each" in the price (e.g., "3 CircuitBreaker (P) $54.00 ($18.00 each)"), 
     keep it as a single item with the total price
   - For items with quantity without "each" (e.g., "7 Stolichnaya Gls"), 
     split into individual items
   - For items with discounts, include the discount in the name and subtract from price
3. Prices:
   - Numbers should be without currency symbols
   - Handle "each" prices by multiplying by quantity
   - Apply item-specific discounts before adding to subtotal
4. Use standard currency codes (USD, SGD, etc.)
5. Format dates as YYYY-MM-DD
6. Calculate:
   - subtotal = sum of all item prices after item-specific discounts
   - Verify total = subtotal + tax + service_charge + other_charge - general_discount
7. Return valid JSON matching the specified structure`;

// Example format to demonstrate to GPT
const FORMAT_EXAMPLE = {
  vendor_name: "Restaurant Name",
  date: "2024-01-31",
  currency: "SGD",
  items: [
    { name: "Chain Reaction (P) (-15% HH discount)", price: 15.30 }, // $18 - 15%
    { name: "3 CircuitBreaker (P)", price: 54.00 }, // 3 items at $18 each
    { name: "Stolichnaya Gl", price: 15.00 }, // From "7 Stolichnaya Gls"
    { name: "Stolichnaya Gl", price: 15.00 }, // Multiple entries for quantity
    { name: "Red Base (P)", price: 0.00 }
  ],
  subtotal: 65.55,  // Sum of items after item-specific discounts
  tax: 4.59,        // 7% GST
  service_charge: 6.56,  // 10% service charge
  other_charge: 0.00,
  general_discount: 5.00,  // Discounts not tied to specific items
  total: 71.70
};

// Validate parsed data structure and calculations
function validateParsedData(data) {
  const requiredFields = [
    'vendor_name', 'date', 'currency', 'items',
    'subtotal', 'tax', 'service_charge', 'other_charge', 'general_discount', 'total'
  ];

  // Check required fields
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate items array
  if (!Array.isArray(data.items)) {
    throw new Error('Items must be an array');
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
    const { text } = JSON.parse(event.body);
    if (!text) {
      throw new Error('No OCR text provided');
    }

    console.log('Attempting to parse OCR text:', text);

    // Additional preprocessing before sending to GPT
    const lines = text.split('\n')
      .map(line => {
        // Try to identify and format item-specific discounts
        if (line.toLowerCase().includes('discount')) {
          const matches = line.match(/(\d+(?:\.\d{2})?)/g); // Extract numbers
          if (matches && matches.length > 0) {
            console.log('Found discount line:', line, 'with amount:', matches[0]);
          }
        }
        return line;
      });
    
    console.log('Preprocessed lines:', lines);

    // Clean up the text before sending to GPT
    const cleanedText = text.replace(/[^\x20-\x7E\n]/g, '') // Remove non-ASCII characters
                           .replace(/\$/g, 'SGD '); // Replace $ with SGD for clarity

    // Call GPT-3.5 to parse the receipt
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106", // Use the latest model that's better at JSON
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: `Parse this receipt text into JSON. Return ONLY valid JSON.\n\nExample:\n${JSON.stringify(FORMAT_EXAMPLE, null, 2)}\n\nReceipt text:\n${cleanedText}`
        }
      ],
      temperature: 0, // Use 0 for more deterministic output
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    // Log the raw GPT response
    console.log('GPT Response:', completion.choices[0].message);

    const gptResponse = completion.choices[0].message.content;
    console.log('GPT Content:', gptResponse);

    // Ensure we have a response
    if (!gptResponse) {
      throw new Error('Empty response from GPT');
    }

    let parsedData;
    try {
      // Handle possible markdown code block wrapping
      const jsonStr = gptResponse
        .replace(/^```json\n/, '') // Remove opening code block
        .replace(/\n```$/, '') // Remove closing code block
        .trim();
      
      console.log('Attempting to parse JSON:', jsonStr);
      parsedData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
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
