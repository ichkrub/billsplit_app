// Netlify serverless function for receipt OCR using make.com
const fetch = require('node-fetch');

// Constants for make.com integration
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

// Helper to clean and parse the response
const parseResponse = (responseText) => {
  try {
    console.log('Attempting to parse response:', responseText);
    
    // If it's already a JSON string, parse it
    if (responseText.trim().startsWith('{')) {
      const data = JSON.parse(responseText);
      
      // Clean up items if they exist
      if (data.items) {
        // If items is a string, try to parse it
        if (typeof data.items === 'string') {
          try {
            data.items = JSON.parse(`[${data.items}]`);
          } catch (e) {
            console.error('Failed to parse items string:', e);
            // If parsing fails, try to clean up the string
            const cleanItems = data.items
              .replace(/\[\[object Object\]\]/g, '') // Remove [object Object]
              .replace(/}\s*,\s*{/g, '},{') // Clean up spacing between objects
              .trim();
            data.items = JSON.parse(`[${cleanItems}]`);
          }
        }
        // If items is already an array, leave it as is
        else if (Array.isArray(data.items)) {
          // Items is already in correct format
        }
        // If items is an object, wrap it in an array
        else if (typeof data.items === 'object') {
          data.items = [data.items];
        }
      }

      return data;
    }
    
    // Try to clean up the response if it's not valid JSON
    const cleaned = responseText
      .replace(/\[\[object Object\]\]/g, '')
      .replace(/}\s*,\s*{/g, '},{')
      .trim();
      
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Error parsing response:', error);
    console.error('Response text was:', responseText);
    throw new Error(`Failed to parse Make.com response: ${error.message}`);
  }
};

// Handler function
exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    
    // Log the request (excluding the image data for brevity)
    console.log('Request body:', {
      ...body,
      image: body.image ? `${body.image.substring(0, 50)}...` : undefined
    });

    // Validate required fields
    if (!body.image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No image provided' })
      };
    }

    if (!MAKE_WEBHOOK_URL) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Make.com webhook URL not configured' })
      };
    }

    console.log('Sending request to Make.com...');
    
    // Send request to make.com
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: body.image,
        config: {
          expected_currency: 'SGD',
          vendor_type: 'restaurant',
          region: 'SG'
        }
      })
    });

    // Log the make.com response status
    console.log('Make.com response status:', response.status);

    // Handle non-OK response
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Make.com error response:', errorText);
      throw new Error(`Make.com API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Get the response text
    const responseText = await response.text();
    console.log('Raw Make.com response:', responseText);

    // Parse and clean the response
    const result = parseResponse(responseText);
    
    // Log the cleaned result
    console.log('Cleaned and parsed response:', JSON.stringify(result, null, 2));
    
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Error details:', error);
    return {
      statusCode: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to process receipt',
        details: error.message,
        stack: error.stack
      })
    };
  }
};
