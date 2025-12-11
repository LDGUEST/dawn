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
  module.exports.default = handler;
}

// For Cloudflare Workers (modern API - preferred)
export default {
  async fetch(request, env) {
    // Set environment variables from Cloudflare Workers env
    globalThis.SHOPIFY_STORE = env.SHOPIFY_STORE;
    globalThis.SHOPIFY_ADMIN_API_TOKEN = env.SHOPIFY_ADMIN_API_TOKEN;
    return handleRequest(request);
  },
};

// For Cloudflare Workers (legacy API - fallback for older Workers)
if (typeof addEventListener !== 'undefined' && typeof exports === 'undefined' && typeof globalThis !== 'undefined') {
  addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event.request));
  });
}

async function handler(req, res) {
  // Set CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.writeHead(405, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    // Get request body - Vercel provides req.body as parsed JSON
    let body;
    try {
      if (req.body) {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } else {
        // Read from stream if needed
        let data = '';
        req.on('data', (chunk) => {
          data += chunk.toString();
        });
        await new Promise((resolve) => req.on('end', resolve));
        body = data ? JSON.parse(data) : {};
      }
    } catch (parseError) {
      console.error('Body parse error:', parseError);
      res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Invalid request body',
          message: 'Could not parse request body as JSON.',
        })
      );
      return;
    }

    const { order_number, email } = body || {};

    // Comprehensive logging
    console.log('🔍 API - Request received:', {
      order_number,
      email: email ? email.substring(0, 3) + '***' : null,
      fullEmail: email, // Log full email for debugging (remove in production)
      orderNumberType: typeof order_number,
      emailType: typeof email,
    });

    // Validate input
    if (!order_number || !email) {
      res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Missing required fields',
          message: 'Order number and email are required.',
        })
      );
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Invalid email format',
          message: 'Please provide a valid email address.',
        })
      );
      return;
    }

    // Get Shopify API credentials from environment
    const shopifyStore = process.env.SHOPIFY_STORE || process.env.SHOPIFY_STORE_URL;
    const shopifyToken = process.env.SHOPIFY_ADMIN_API_TOKEN;

    console.log('Environment check:', {
      hasStore: !!shopifyStore,
      hasToken: !!shopifyToken,
      storeValue: shopifyStore ? shopifyStore.substring(0, 10) + '...' : 'missing',
    });

    if (!shopifyStore || !shopifyToken) {
      console.error('Missing Shopify API credentials:', {
        SHOPIFY_STORE: !!shopifyStore,
        SHOPIFY_ADMIN_API_TOKEN: !!shopifyToken,
      });
      res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Server configuration error',
          message: 'Service is not properly configured. Please contact support.',
          details: 'Missing environment variables. Check Vercel dashboard.',
        })
      );
      return;
    }

    // Clean shopify store URL (remove https:// and trailing slash)
    const cleanStore = shopifyStore.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const apiUrl = `https://${cleanStore}/admin/api/2024-01/orders.json`;

    // Query Shopify Admin API by email only (name parameter doesn't work as a filter)
    // We'll filter by order number in JavaScript after getting the results
    const queryParams = new URLSearchParams({
      email: email.toLowerCase(),
      status: 'any',
      limit: '250', // Increased limit to ensure we get all orders for the email
    });

    console.log('Querying Shopify API:', { email: email.toLowerCase(), order_number });

    const response = await fetch(`${apiUrl}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': shopifyToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.error('Shopify API authentication failed');
        res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'Authentication error',
            message: 'Service configuration error. Please contact support.',
          })
        );
        return;
      }

      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    const orders = data.orders || [];

    console.log(`Found ${orders.length} orders for email ${email.substring(0, 3)}***`);

    // Clean the order number for comparison (remove # and any whitespace)
    const cleanOrderNumber = order_number.toString().replace(/[#\s]/g, '').trim();
    const cleanEmail = email.toLowerCase().trim();

    console.log('🔍 Matching - Looking for:', {
      cleanOrderNumber,
      cleanEmail,
      totalOrdersToCheck: orders.length
    });

    // Find exact match by order number (name) and email
    // Handle both "#1779" and "1779" formats
    let matchAttempts = [];
    const matchingOrder = orders.find((order, index) => {
      if (!order.email || !order.name) {
        matchAttempts.push({ index, reason: 'Missing email or name', orderName: order.name, orderEmail: order.email });
        return false;
      }

      // Clean order name (remove # prefix and whitespace)
      const orderName = order.name.replace(/^#/, '').replace(/\s/g, '').trim();
      const orderEmail = order.email.toLowerCase().trim();

      // Compare cleaned values
      const nameMatch = orderName === cleanOrderNumber;
      const emailMatch = orderEmail === cleanEmail;

      // Log each comparison attempt
      const attempt = {
        index,
        orderName: order.name,
        cleanedOrderName: orderName,
        orderEmail: order.email,
        cleanedOrderEmail: orderEmail,
        nameMatch,
        emailMatch,
        bothMatch: nameMatch && emailMatch
      };
      matchAttempts.push(attempt);

      if (nameMatch && emailMatch) {
        console.log('✅ Match found!', attempt);
        return true;
      }

      // Log near-matches for debugging
      if (nameMatch && !emailMatch) {
        console.log('⚠️ Name matches but email differs:', attempt);
      }
      if (!nameMatch && emailMatch) {
        console.log('⚠️ Email matches but name differs:', attempt);
      }

      return false;
    });

    // Log all match attempts if no match found
    if (!matchingOrder && orders.length > 0) {
      console.log('📋 All match attempts:', matchAttempts.slice(0, 10)); // Log first 10
    }

    if (!matchingOrder) {
      // Enhanced error logging for debugging
      console.error('Order not found:', {
        requestedOrderNumber: cleanOrderNumber,
        requestedEmail: cleanEmail,
        ordersFound: orders.length,
        orderNumbers: orders.map((o) => o.name).slice(0, 5), // Log first 5 order numbers
        orderEmails: orders.map((o) => o.email?.toLowerCase()).slice(0, 5),
        matchAttempts: matchAttempts.slice(0, 5)
      });

      res.writeHead(404, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Order not found',
          message:
            'No order found with that order number and email address. Please verify both the order number and email address are correct.',
        })
      );
      return;
    }

    // Extract download links from fulfillments
    const downloads = [];

    if (matchingOrder.fulfillments) {
      matchingOrder.fulfillments.forEach((fulfillment) => {
        if (fulfillment.tracking_urls && fulfillment.tracking_urls.length > 0) {
          fulfillment.tracking_urls.forEach((url, index) => {
            downloads.push({
              name: fulfillment.tracking_company || `Download ${index + 1}`,
              url: url,
            });
          });
        }
      });
    }

    // Check line items for digital download links
    if (matchingOrder.line_items) {
      matchingOrder.line_items.forEach((item) => {
        if (item.properties) {
          item.properties.forEach((prop) => {
            if (
              prop.name &&
              (prop.name.toLowerCase().includes('download') || prop.name.toLowerCase().includes('url'))
            ) {
              if (prop.value && (prop.value.startsWith('http://') || prop.value.startsWith('https://'))) {
                downloads.push({
                  name: item.name || 'Download',
                  url: prop.value,
                });
              }
            }
          });
        }
      });
    }

    // Return order data with downloads and order status URL
    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: true,
        order: {
          name: matchingOrder.name,
          created_at: matchingOrder.created_at,
          total_price: matchingOrder.total_price,
          currency: matchingOrder.currency,
          order_status_url: matchingOrder.order_status_url || null,
        },
        downloads: downloads,
        order_status_url: matchingOrder.order_status_url || null,
      })
    );
  } catch (error) {
    console.error('Order lookup error:', error);
    console.error('Error stack:', error.stack);
    res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Internal server error',
        message: 'An error occurred while processing your request. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      })
    );
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
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const body = await request.json();
    const { order_number, email } = body;

    // Comprehensive logging for Cloudflare Workers
    console.log('🔍 API (Cloudflare) - Request received:', {
      order_number,
      email: email ? email.substring(0, 3) + '***' : null,
      fullEmail: email, // Log full email for debugging
      orderNumberType: typeof order_number,
      emailType: typeof email,
    });

    if (!order_number || !email) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          message: 'Order number and email are required.',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid email format',
          message: 'Please provide a valid email address.',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const shopifyStore = globalThis.SHOPIFY_STORE || process?.env?.SHOPIFY_STORE;
    const shopifyToken = globalThis.SHOPIFY_ADMIN_API_TOKEN || process?.env?.SHOPIFY_ADMIN_API_TOKEN;

    if (!shopifyStore || !shopifyToken) {
      return new Response(
        JSON.stringify({
          error: 'Server configuration error',
          message: 'Service is not properly configured. Please contact support.',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const cleanStore = shopifyStore.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const apiUrl = `https://${cleanStore}/admin/api/2024-01/orders.json`;

    // Query Shopify Admin API by email only (name parameter doesn't work as a filter)
    // We'll filter by order number in JavaScript after getting the results
    const queryParams = new URLSearchParams({
      email: email.toLowerCase(),
      status: 'any',
      limit: '250', // Increased limit to ensure we get all orders for the email
    });

    console.log('Querying Shopify API:', { email: email.toLowerCase(), order_number });

    const response = await fetch(`${apiUrl}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': shopifyToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return new Response(
          JSON.stringify({
            error: 'Authentication error',
            message: 'Service configuration error. Please contact support.',
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    const orders = data.orders || [];

    console.log(`Found ${orders.length} orders for email ${email.substring(0, 3)}***`);

    // Clean the order number for comparison (remove # and any whitespace)
    const cleanOrderNumber = order_number.toString().replace(/[#\s]/g, '').trim();
    const cleanEmail = email.toLowerCase().trim();

    console.log('🔍 Matching (Cloudflare) - Looking for:', {
      cleanOrderNumber,
      cleanEmail,
      totalOrdersToCheck: orders.length
    });

    // Find exact match by order number (name) and email
    // Handle both "#1779" and "1779" formats
    let matchAttempts = [];
    const matchingOrder = orders.find((order, index) => {
      if (!order.email || !order.name) {
        matchAttempts.push({ index, reason: 'Missing email or name', orderName: order.name, orderEmail: order.email });
        return false;
      }

      // Clean order name (remove # prefix and whitespace)
      const orderName = order.name.replace(/^#/, '').replace(/\s/g, '').trim();
      const orderEmail = order.email.toLowerCase().trim();

      // Compare cleaned values
      const nameMatch = orderName === cleanOrderNumber;
      const emailMatch = orderEmail === cleanEmail;

      // Log each comparison attempt
      const attempt = {
        index,
        orderName: order.name,
        cleanedOrderName: orderName,
        orderEmail: order.email,
        cleanedOrderEmail: orderEmail,
        nameMatch,
        emailMatch,
        bothMatch: nameMatch && emailMatch
      };
      matchAttempts.push(attempt);

      if (nameMatch && emailMatch) {
        console.log('✅ Match found!', attempt);
        return true;
      }

      // Log near-matches for debugging
      if (nameMatch && !emailMatch) {
        console.log('⚠️ Name matches but email differs:', attempt);
      }
      if (!nameMatch && emailMatch) {
        console.log('⚠️ Email matches but name differs:', attempt);
      }

      return false;
    });

    // Log all match attempts if no match found
    if (!matchingOrder && orders.length > 0) {
      console.log('📋 All match attempts:', matchAttempts.slice(0, 10)); // Log first 10
    }

    if (!matchingOrder) {
      // Enhanced error logging for debugging
      const orderDetails = orders.slice(0, 10).map((o) => ({
        name: o.name,
        email: o.email?.toLowerCase(),
        created: o.created_at,
      }));

      console.error('❌ API - Order not found (Cloudflare):', {
        requestedOrderNumber: cleanOrderNumber,
        requestedEmail: cleanEmail,
        ordersFound: orders.length,
        sampleOrders: orderDetails,
        allOrderNumbers: orders.map((o) => o.name),
        allOrderEmails: orders.map((o) => o.email?.toLowerCase()),
        matchAttempts: matchAttempts.slice(0, 5)
      });

      return new Response(
        JSON.stringify({
          error: 'Order not found',
          message: `No order found matching order #${cleanOrderNumber} and email ${email.substring(0, 3)}***. Found ${
            orders.length
          } order(s) for this email. Please verify the order number and email address.`,
          debug: {
            requestedOrderNumber: cleanOrderNumber,
            requestedEmail: email.toLowerCase().trim(),
            ordersFound: orders.length,
            sampleOrderNumbers: orders.slice(0, 5).map((o) => o.name),
          },
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const downloads = [];

    if (matchingOrder.fulfillments) {
      matchingOrder.fulfillments.forEach((fulfillment) => {
        if (fulfillment.tracking_urls && fulfillment.tracking_urls.length > 0) {
          fulfillment.tracking_urls.forEach((url, index) => {
            downloads.push({
              name: fulfillment.tracking_company || `Download ${index + 1}`,
              url: url,
            });
          });
        }
      });
    }

    if (matchingOrder.line_items) {
      matchingOrder.line_items.forEach((item) => {
        if (item.properties) {
          item.properties.forEach((prop) => {
            if (
              prop.name &&
              (prop.name.toLowerCase().includes('download') || prop.name.toLowerCase().includes('url'))
            ) {
              if (prop.value && (prop.value.startsWith('http://') || prop.value.startsWith('https://'))) {
                downloads.push({
                  name: item.name || 'Download',
                  url: prop.value,
                });
              }
            }
          });
        }
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          name: matchingOrder.name,
          created_at: matchingOrder.created_at,
          total_price: matchingOrder.total_price,
          currency: matchingOrder.currency,
          order_status_url: matchingOrder.order_status_url || null,
        },
        downloads: downloads,
        order_status_url: matchingOrder.order_status_url || null,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Order lookup error:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'An error occurred while processing your request. Please try again later.',
        details: error.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
