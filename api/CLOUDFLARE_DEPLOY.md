# Cloudflare Workers Deployment Guide

Step-by-step instructions to deploy the Shopify Order Lookup API to Cloudflare Workers.

## Prerequisites

1. A Cloudflare account (free tier works)
2. Node.js installed on your computer (for Wrangler CLI)
3. Shopify Admin API token with `read_orders` scope

---

## Step 1: Install Wrangler CLI

Open your terminal/command prompt and run:

```bash
npm install -g wrangler
```

Or if you prefer using npx (no installation needed):
```bash
npx wrangler --version
```

---

## Step 2: Login to Cloudflare

In your terminal, run:

```bash
wrangler login
```

This will open your browser to authenticate with Cloudflare. Click "Allow" to authorize Wrangler.

---

## Step 3: Get Your Shopify Admin API Token

1. Go to your Shopify Admin: https://cookingwithkahnke.myshopify.com/admin
2. Navigate to **Settings** → **Apps and sales channels**
3. Click **Develop apps** (at the bottom)
4. Click **Create an app**
5. Name it "Order Lookup API" (or any name you prefer)
6. Click **Create app**
7. Go to the **API credentials** tab
8. Click **Configure Admin API scopes**
9. Find and enable **`read_orders`** scope
10. Click **Save**
11. Click **Install app** (top right)
12. Copy the **Admin API access token** (you'll need this in Step 5)

---

## Step 4: Navigate to the API Directory

In your terminal, navigate to the `api` folder:

```bash
cd api
```

Or if you're in the project root:
```bash
cd C:\Users\Admin\dawn\api
```

---

## Step 5: Set Environment Variables (Secrets)

Set your Shopify credentials as Cloudflare Workers secrets:

```bash
wrangler secret put SHOPIFY_STORE
```
When prompted, enter: `cookingwithkahnke.myshopify.com`

```bash
wrangler secret put SHOPIFY_ADMIN_API_TOKEN
```
When prompted, paste your Admin API token from Step 3.

---

## Step 6: Deploy to Cloudflare Workers

Deploy your worker:

```bash
wrangler deploy
```

You'll see output like:
```
✨  Deployed to https://shopify-order-lookup.your-subdomain.workers.dev
```

**Copy this URL** - you'll need it in Step 8!

---

## Step 7: Test the Deployment

Test your API endpoint. The URL format is:
```
https://shopify-order-lookup.your-subdomain.workers.dev
```

You can test it with curl (in terminal) or a tool like Postman:

```bash
curl -X POST https://shopify-order-lookup.your-subdomain.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"order_number":"1001","email":"customer@example.com"}'
```

Or test in your browser by going to the URL (it should show an error about method not allowed, which is expected for GET requests).

---

## Step 8: Configure in Shopify Theme

1. Go to Shopify Admin → **Online Store** → **Themes**
2. Click **Actions** → **Edit code** (on your active theme)
3. Navigate to **Sections** → **find-order-page.liquid**
4. Find the section settings (scroll to bottom)
5. Look for **"API Endpoint URL"** field
6. Enter your Cloudflare Workers URL: `https://shopify-order-lookup.your-subdomain.workers.dev`
7. Click **Save**

---

## Step 9: Test the Full Flow

1. Go to your store: https://cookingwithkahnke.com/pages/find-my-order
2. Enter a test order number and email
3. Click "Find My Order"
4. You should be redirected to the guest order status page with download links!

---

## Troubleshooting

### Error: "Missing environment variables"
- Make sure you ran `wrangler secret put` for both variables
- Check that secrets are set: `wrangler secret list`

### Error: "Authentication error" (401/403)
- Verify your Shopify Admin API token has `read_orders` scope enabled
- Make sure you clicked "Install app" after creating it

### Error: "Order not found"
- Check that the order number format matches (try without the # symbol)
- Verify the email matches exactly (case-insensitive)

### CORS Errors
- The API already has CORS headers configured
- If issues persist, check that your store domain is allowed

### Worker not deploying
- Make sure you're in the `api` directory
- Check that `wrangler.toml` exists in the `api` folder
- Verify you're logged in: `wrangler whoami`

---

## Updating the Worker

If you make changes to `api/find-order.js`:

1. Save your changes
2. Run `wrangler deploy` again
3. Changes deploy instantly (no downtime)

---

## Viewing Logs

To see real-time logs from your worker:

```bash
wrangler tail
```

This shows all requests and any console.log output.

---

## Cost

Cloudflare Workers free tier includes:
- 100,000 requests per day
- Unlimited requests on paid plans ($5/month)

This should be more than enough for order lookups!

---

## Need Help?

- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/
- Wrangler CLI Docs: https://developers.cloudflare.com/workers/wrangler/
- Shopify Admin API: https://shopify.dev/docs/api/admin-rest

