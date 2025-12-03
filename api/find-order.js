/**
 * Shopify Order Lookup Serverless Function
 * Queries Shopify Admin API to find orders by order number and email
 * 
 * Compatible with:
 * - Vercel (serverless function)
 * - Netlify (serverless function)
 * - Cloudflare Workers
 */

// For Vercel/Netlify
if (typeof module !== 'undefined' && module.exports) {
  module.exports = handler;
}

// For Cloudflare Workers
if (typeof addEventListener !== 'undefined') {
  addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });
}

async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get request body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { order_number, email } = body;

    // Validate input
    if (!order_number || !email) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Missing required fields',
          message: 'Order number and email are required.'
        })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Invalid email format',
          message: 'Please provide a valid email address.'
        })
      };
    }

    // Get Shopify API credentials from environment
    const shopifyStore = process.env.SHOPIFY_STORE || process.env.SHOPIFY_STORE_URL;
    const shopifyToken = process.env.SHOPIFY_ADMIN_API_TOKEN;

    if (!shopifyStore || !shopifyToken) {
      console.error('Missing Shopify API credentials');
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Server configuration error',
          message: 'Service is not properly configured. Please contact support.'
        })
      };
    }

    // Clean shopify store URL (remove https:// and trailing slash)
    const cleanStore = shopifyStore.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const apiUrl = `https://${cleanStore}/admin/api/2024-01/orders.json`;

    // Query Shopify Admin API
    // First, try to find by email and order name
    const queryParams = new URLSearchParams({
      email: email,
      name: order_number,
      status: 'any',
      limit: '10'
    });

    const response = await fetch(`${apiUrl}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': shopifyToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.error('Shopify API authentication failed');
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            error: 'Authentication error',
            message: 'Service configuration error. Please contact support.'
          })
        };
      }

      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    const orders = data.orders || [];

    // Find exact match by order number (name) and email
    const matchingOrder = orders.find(order => {
      const orderName = order.name ? order.name.replace(/^#/, '') : '';
      const orderEmail = order.email ? order.email.toLowerCase() : '';
      return orderName === order_number.toString() && orderEmail === email.toLowerCase();
    });

    if (!matchingOrder) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Order not found',
          message: 'No order found with that order number and email address.'
        })
      };
    }

    // Extract download links from fulfillments
    const downloads = [];
    
    if (matchingOrder.fulfillments) {
      matchingOrder.fulfillments.forEach(fulfillment => {
        if (fulfillment.tracking_urls && fulfillment.tracking_urls.length > 0) {
          fulfillment.tracking_urls.forEach((url, index) => {
            downloads.push({
              name: fulfillment.tracking_company || `Download ${index + 1}`,
              url: url
            });
          });
        }
      });
    }

    // Check line items for digital download links
    if (matchingOrder.line_items) {
      matchingOrder.line_items.forEach(item => {
        // Some digital download apps store URLs in properties or metafields
        if (item.properties) {
          item.properties.forEach(prop => {
            if (prop.name && (prop.name.toLowerCase().includes('download') || prop.name.toLowerCase().includes('url'))) {
              if (prop.value && (prop.value.startsWith('http://') || prop.value.startsWith('https://'))) {
                downloads.push({
                  name: item.name || 'Download',
                  url: prop.value
                });
              }
            }
          });
        }
      });
    }

    // Return order data with downloads
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        order: {
          name: matchingOrder.name,
          created_at: matchingOrder.created_at,
          total_price: matchingOrder.total_price,
          currency: matchingOrder.currency
        },
        downloads: downloads
      })
    };

  } catch (error) {
    console.error('Order lookup error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: 'An error occurred while processing your request. Please try again later.'
      })
    };
  }
}

// Cloudflare Workers handler
async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    const body = await request.json();
    const { order_number, email } = body;

    if (!order_number || !email) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields',
        message: 'Order number and email are required.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid email format',
        message: 'Please provide a valid email address.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Get environment variables (Cloudflare Workers)
    const shopifyStore = SHOPIFY_STORE || SHOPIFY_STORE_URL;
    const shopifyToken = SHOPIFY_ADMIN_API_TOKEN;

    if (!shopifyStore || !shopifyToken) {
      return new Response(JSON.stringify({ 
        error: 'Server configuration error',
        message: 'Service is not properly configured. Please contact support.'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const cleanStore = shopifyStore.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const apiUrl = `https://${cleanStore}/admin/api/2024-01/orders.json`;

    const queryParams = new URLSearchParams({
      email: email,
      name: order_number,
      status: 'any',
      limit: '10'
    });

    const response = await fetch(`${apiUrl}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': shopifyToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return new Response(JSON.stringify({ 
          error: 'Authentication error',
          message: 'Service configuration error. Please contact support.'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    const orders = data.orders || [];

    const matchingOrder = orders.find(order => {
      const orderName = order.name ? order.name.replace(/^#/, '') : '';
      const orderEmail = order.email ? order.email.toLowerCase() : '';
      return orderName === order_number.toString() && orderEmail === email.toLowerCase();
    });

    if (!matchingOrder) {
      return new Response(JSON.stringify({ 
        error: 'Order not found',
        message: 'No order found with that order number and email address.'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const downloads = [];
    
    if (matchingOrder.fulfillments) {
      matchingOrder.fulfillments.forEach(fulfillment => {
        if (fulfillment.tracking_urls && fulfillment.tracking_urls.length > 0) {
          fulfillment.tracking_urls.forEach((url, index) => {
            downloads.push({
              name: fulfillment.tracking_company || `Download ${index + 1}`,
              url: url
            });
          });
        }
      });
    }

    if (matchingOrder.line_items) {
      matchingOrder.line_items.forEach(item => {
        if (item.properties) {
          item.properties.forEach(prop => {
            if (prop.name && (prop.name.toLowerCase().includes('download') || prop.name.toLowerCase().includes('url'))) {
              if (prop.value && (prop.value.startsWith('http://') || prop.value.startsWith('https://'))) {
                downloads.push({
                  name: item.name || 'Download',
                  url: prop.value
                });
              }
            }
          });
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      order: {
        name: matchingOrder.name,
        created_at: matchingOrder.created_at,
        total_price: matchingOrder.total_price,
        currency: matchingOrder.currency
      },
      downloads: downloads
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Order lookup error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: 'An error occurred while processing your request. Please try again later.'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

