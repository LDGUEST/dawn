# Shopify Order Lookup API

Serverless function to query Shopify orders by order number and email address.

## Setup

### 1. Get Shopify Admin API Credentials

1. Go to your Shopify Admin
2. Navigate to **Settings** → **Apps and sales channels** → **Develop apps**
3. Click **Create an app**
4. Name it "Order Lookup" (or any name)
5. Click **Create app**
6. Go to **API credentials** tab
7. Click **Configure Admin API scopes**
8. Enable `read_orders` scope
9. Click **Save**
10. Click **Install app**
11. Copy the **Admin API access token**

### 2. Deploy to Serverless Platform

#### Option A: Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to the `api/` directory: `cd api`
3. Run: `vercel`
4. Follow prompts to link your project
5. Add environment variables in Vercel dashboard:
   - `SHOPIFY_STORE` = `cookingwithkahnke.myshopify.com`
   - `SHOPIFY_ADMIN_API_TOKEN` = (your token from step 1)
6. Deploy: `vercel --prod`

The function will be available at: `https://your-project.vercel.app/api/find-order`

#### Option B: Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Create `netlify.toml` in the `api/` directory:
   ```toml
   [build]
     functions = "."
   
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```
3. Rename `find-order.js` to `find-order.js` (keep as is)
4. Run: `netlify deploy --prod`
5. Add environment variables in Netlify dashboard:
   - `SHOPIFY_STORE` = `cookingwithkahnke.myshopify.com`
   - `SHOPIFY_ADMIN_API_TOKEN` = (your token from step 1)

The function will be available at: `https://your-site.netlify.app/api/find-order`

#### Option C: Cloudflare Workers

1. Install Wrangler CLI: `npm i -g wrangler`
2. Create `wrangler.toml` in the `api/` directory:
   ```toml
   name = "shopify-order-lookup"
   main = "find-order.js"
   compatibility_date = "2024-01-01"
   ```
3. Run: `wrangler login`
4. Add secrets: `wrangler secret put SHOPIFY_STORE` and `wrangler secret put SHOPIFY_ADMIN_API_TOKEN`
5. Deploy: `wrangler publish`

The function will be available at: `https://shopify-order-lookup.your-subdomain.workers.dev`

### 3. Update Theme Configuration

1. Go to Shopify Admin → **Online Store** → **Themes** → **Customize**
2. Navigate to the "Find My Order" page
3. In the section settings, enter your API endpoint URL in the **API Endpoint URL** field
4. Save

## API Endpoint

**URL**: `POST /api/find-order`

**Request Body**:
```json
{
  "order_number": "1001",
  "email": "customer@example.com"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "order": {
    "name": "#1001",
    "created_at": "2024-01-15T10:30:00Z",
    "total_price": "29.99",
    "currency": "USD"
  },
  "downloads": [
    {
      "name": "Digital Product",
      "url": "https://download-link.com/file.pdf"
    }
  ]
}
```

**Error Responses**:

- `400` - Missing or invalid input
- `404` - Order not found
- `500` - Server error

## Security Notes

- The function validates email format and requires both order number and email
- CORS is enabled for all origins (you may want to restrict this to your store domain)
- Rate limiting should be configured at the platform level
- Never commit `.env` files or API tokens to version control

## Troubleshooting

**401/403 Errors**: Check that your Admin API token has the `read_orders` scope enabled.

**404 Errors**: Verify the order number format matches Shopify's format (usually just the number, e.g., "1001" not "#1001").

**CORS Errors**: Ensure the API endpoint URL is correctly configured in the theme settings.

