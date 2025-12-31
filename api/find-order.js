/**
 * Shopify Order Lookup Serverless Function
 * Queries Shopify Admin API to find orders by order number and email
 *
 * Compatible with:
 * - Vercel (serverless function)
 * - Netlify (serverless function)
 * - Cloudflare Workers
 */

// Rate Limiting Configuration
const RATE_LIMIT_CONFIG = {
  maxRequests: 10, // Maximum requests per window
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  cleanupInterval: 60 * 60 * 1000, // Clean up old entries every hour
};

// In-memory rate limit store
// Format: { ip: [{ timestamp }, ...] }
const rateLimitStore = new Map();
let lastCleanup = Date.now();

/**
 * Rate Limiter - Sliding Window Implementation
 */
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if IP is within rate limit
   * @param {string} ip - IP address
   * @returns {Object} { allowed: boolean, remaining: number, resetTime: number }
   */
  check(ip) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or create request history for this IP
    if (!rateLimitStore.has(ip)) {
      rateLimitStore.set(ip, []);
    }

    const requests = rateLimitStore.get(ip);

    // Remove requests outside the window
    const validRequests = requests.filter((timestamp) => timestamp > windowStart);
    rateLimitStore.set(ip, validRequests);

    // Check if limit exceeded
    const requestCount = validRequests.length;
    const allowed = requestCount < this.maxRequests;
    const remaining = Math.max(0, this.maxRequests - requestCount);
    const resetTime = validRequests.length > 0 ? validRequests[0] + this.windowMs : now + this.windowMs;

    // Add current request if allowed
    if (allowed) {
      validRequests.push(now);
      rateLimitStore.set(ip, validRequests);
    }

    // Periodic cleanup of old entries
    if (now - lastCleanup > RATE_LIMIT_CONFIG.cleanupInterval) {
      this.cleanup();
      lastCleanup = now;
    }

    return { allowed, remaining, resetTime };
  }

  /**
   * Clean up old entries from store
   */
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [ip, requests] of rateLimitStore.entries()) {
      const validRequests = requests.filter((timestamp) => timestamp > windowStart);
      if (validRequests.length === 0) {
        rateLimitStore.delete(ip);
      } else {
        rateLimitStore.set(ip, validRequests);
      }
    }
  }
}

const rateLimiter = new RateLimiter(RATE_LIMIT_CONFIG.maxRequests, RATE_LIMIT_CONFIG.windowMs);

/**
 * Extract IP address from request (handles different platforms)
 */
function getClientIP(req, request) {
  // For Vercel/Netlify
  if (req) {
    // Check various headers (order matters - most trusted first)
    return (
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.headers['cf-connecting-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }

  // For Cloudflare Workers
  if (request) {
    return (
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'
    );
  }

  return 'unknown';
}

/**
 * Rate limit check middleware
 */
function checkRateLimit(ip) {
  const result = rateLimiter.check(ip);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    return {
      allowed: false,
      status: 429,
      message: 'Too many requests. Please try again later.',
      retryAfter,
      resetTime: result.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: result.remaining,
    resetTime: result.resetTime,
  };
}

// For Vercel/Netlify
if (typeof module !== 'undefined' && module.exports) {
  module.exports = handler;
  module.exports.default = handler;
}

// For Cloudflare Workers
if (typeof addEventListener !== 'undefined') {
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

  // Rate limiting check
  const clientIP = getClientIP(req, null);
  const rateLimitResult = checkRateLimit(clientIP);

  if (!rateLimitResult.allowed) {
    res.writeHead(429, {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Retry-After': rateLimitResult.retryAfter.toString(),
      'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
    });
    res.end(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: rateLimitResult.message,
        retryAfter: rateLimitResult.retryAfter,
      })
    );
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

    console.log('Request received:', { order_number, email: email ? email.substring(0, 3) + '***' : null });

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

    // Query Shopify Admin API
    const queryParams = new URLSearchParams({
      email: email,
      name: order_number,
      status: 'any',
      limit: '10',
    });

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

    // Find exact match by order number (name) and email
    const matchingOrder = orders.find((order) => {
      const orderName = order.name ? order.name.replace(/^#/, '') : '';
      const orderEmail = order.email ? order.email.toLowerCase() : '';
      return orderName === order_number.toString() && orderEmail === email.toLowerCase();
    });

    if (!matchingOrder) {
      res.writeHead(404, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Order not found',
          message: 'No order found with that order number and email address.',
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
    res.writeHead(200, {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
      'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
    });
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
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }

  // Rate limiting check
  const clientIP = getClientIP(null, request);
  const rateLimitResult = checkRateLimit(clientIP);

  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: rateLimitResult.message,
        retryAfter: rateLimitResult.retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
          'Retry-After': rateLimitResult.retryAfter.toString(),
          'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const { order_number, email } = body;

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

    const shopifyStore = SHOPIFY_STORE || SHOPIFY_STORE_URL;
    const shopifyToken = SHOPIFY_ADMIN_API_TOKEN;

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

    const queryParams = new URLSearchParams({
      email: email,
      name: order_number,
      status: 'any',
      limit: '10',
    });

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

    const matchingOrder = orders.find((order) => {
      const orderName = order.name ? order.name.replace(/^#/, '') : '';
      const orderEmail = order.email ? order.email.toLowerCase() : '';
      return orderName === order_number.toString() && orderEmail === email.toLowerCase();
    });

    if (!matchingOrder) {
      return new Response(
        JSON.stringify({
          error: 'Order not found',
          message: 'No order found with that order number and email address.',
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
          ...corsHeaders,
          'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error('Order lookup error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'An error occurred while processing your request. Please try again later.',
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
