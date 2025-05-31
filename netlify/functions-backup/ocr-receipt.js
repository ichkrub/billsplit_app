// Netlify serverless function for receipt OCR using Google Cloud Vision API
const { ImageAnnotatorClient } = require('@google-cloud/vision');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    console.log('Starting OCR process...');
    // Parse the request body
    const { image } = JSON.parse(event.body);
    if (!image) {
      throw new Error('No image provided');
    }

    console.log('Creating Vision API client...');
    // Log credentials for debugging (redacting sensitive parts)
    console.log('Client email:', process.env.GOOGLE_VISION_CLIENT_EMAIL);
    console.log('Private key exists:', !!process.env.GOOGLE_VISION_PRIVATE_KEY);

    // Create a client for Google Cloud Vision API
    const client = new ImageAnnotatorClient({
      credentials: {
        client_email: process.env.GOOGLE_VISION_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_VISION_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
    });

    // Convert base64 image to buffer
    const imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    console.log('Image buffer size:', imageBuffer.length, 'bytes');

    console.log('Calling Vision API...');
    // Perform OCR
    const [result] = await client.textDetection(imageBuffer);
    console.log('Vision API response:', JSON.stringify(result, null, 2));
    
    const detections = result.textAnnotations;
    if (!detections || detections.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'No text detected in image',
          details: 'The image might be too blurry or no text was detected'
        }),
      };
    }
    
    // Get the first annotation that contains complete text
    const fullText = detections[0]?.description || '';
    console.log('Raw OCR text:', fullText);

    // Get all detailed text annotations for better structure analysis
    const blocks = result.fullTextAnnotation?.pages?.[0]?.blocks || [];
    console.log('Text blocks:', JSON.stringify(blocks, null, 2));

    // Process and clean the OCR text
    const lines = fullText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      // Remove purely numeric lines (likely to be item numbers)
      .filter(line => !/^\d+$/.test(line));

    // Group items with their discounts and format them
    const processedLines = [];
    let currentItem = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = lines[i + 1];
      
      // Extract price and check if it's a discount line
      const priceMatch = line.match(/\$(\d+\.?\d*)/);
      const isDiscount = line.toLowerCase().includes('discount');
      
      if (isDiscount && currentItem) {
        // Add discount info to the previous item
        const discountMatch = line.match(/(\d+)%/);
        const discountAmount = priceMatch ? parseFloat(priceMatch[1]) : 0;
        const discountPercent = discountMatch ? discountMatch[1] : '15'; // Default to 15% for HH
        
        // Format the item with its discount
        const itemPrice = parseFloat(currentItem.match(/\$(\d+\.?\d*)/)[1]);
        const discountedPrice = itemPrice - discountAmount;
        currentItem = currentItem.replace(/\$\d+\.?\d*/, `$${discountedPrice.toFixed(2)} (-${discountPercent}% HH discount)`);
        
        processedLines[processedLines.length - 1] = currentItem;
        currentItem = null;
      } else if (priceMatch && !isDiscount) {
        // Handle quantity notation (e.g., "3 CircuitBreaker (P) $18.00 each" or "7 Stolichnaya Gls")
        const qtyMatch = line.match(/^(\d+)\s+(.+?)\s+\$(\d+\.?\d*)\s*(each)?/i);
        
        if (qtyMatch) {
          const [_, qty, itemName, unitPrice, isEach] = qtyMatch;
          if (isEach) {
            // Keep as single line with total price (e.g., 3 CircuitBreaker)
            const totalPrice = parseFloat(unitPrice) * parseInt(qty);
            processedLines.push(`${qty} ${itemName} $${totalPrice.toFixed(2)} ($${unitPrice} each)`);
          } else {
            // Split into individual items (e.g., 7 Stolichnaya)
            for (let j = 0; j < parseInt(qty); j++) {
              processedLines.push(`${itemName} $${unitPrice}`);
            }
          }
        } else {
          // Regular item
          currentItem = line;
          processedLines.push(line);
        }
      }
    }

    // Clean up the processed lines
    const cleanedLines = processedLines.map(line => line
      // Normalize currency symbols
      .replace(/[$S\u0024\uFE69\uFF04\u2211]/g, '$')
      // Clean up spaces around currency and math symbols
      .replace(/\s*\$\s*/g, '$')
      .replace(/\s*-\s*/g, '-')
      .replace(/\s*%\s*/g, '%')
      // Remove any other special characters
      .replace(/[^\w\s$()x%.-]/g, '')
      .trim()
    );

    const cleanedText = cleanedLines.join('\n');
    console.log('Cleaned OCR text:', cleanedText);
    console.log('Original lines:', lines);
    console.log('Processed lines:', processedLines);
    console.log('Final cleaned lines:', cleanedLines);

    if (!cleanedText) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'No text could be extracted from the image',
          details: 'The image might be too blurry or no text was detected'
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({
        text: cleanedText,
        raw: fullText, // Include raw text for debugging
        blocks: blocks, // Include block structure for debugging
      }),
    };
  } catch (error) {
    console.error('OCR Error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // Check for specific Vision API errors
    if (error.code === 7) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Failed to authenticate with Google Vision API',
          details: 'Please check API credentials'
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process image',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
    };
  }
};
