# Vercel Deployment Guide

## Step 1: Get Shopify Admin API Token

1. Go to your Shopify Admin: https://cookingwithkahnke.myshopify.com/admin
2. Navigate to **Settings** → **Apps and sales channels** → **Develop apps**
3. Click **Create an app**
4. Name it "Order Lookup API" (or any name)
5. Click **Create app**
6. Go to **API credentials** tab
7. Click **Configure Admin API scopes**
8. Enable `read_orders` scope
9. Click **Save**
10. Click **Install app**
11. Copy the **Admin API access token** (you'll need this for Step 3)

## Step 2: Deploy to Vercel (Web Interface)

1. Go to https://vercel.com and sign in with `cookingwithkahnke@gmail.com`
2. Click **"Add New Project"** or **"Import Project"**
3. Select **"Import Git Repository"**
4. Choose your GitHub account and select the `dawn` repository
5. Configure the project:
   - **Framework Preset**: Select **"Other"**
   - **Root Directory**: Leave as `./` (root)
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: Leave empty (no build needed)
6. Click **"Environment Variables"** and add these two:
   - **Name**: `SHOPIFY_STORE`
     **Value**: `cookingwithkahnke.myshopify.com`
   - **Name**: `SHOPIFY_ADMIN_API_TOKEN`
     **Value**: (paste the token from Step 1)
7. Click **"Deploy"**

## Step 3: Get Your API Endpoint URL

After deployment completes:
1. Go to your Vercel project dashboard
2. Click on the deployment
3. Copy the **"Production"** URL (e.g., `https://dawn-xxxxx.vercel.app`)
4. Your API endpoint will be: `https://dawn-xxxxx.vercel.app/api/find-order`

## Step 4: Update Frontend with API Endpoint

1. Open `templates/page.find-order.json` in your editor
2. Find this line (around line 33):
   ```javascript
   const API_ENDPOINT = 'https://your-api-endpoint.vercel.app/api/find-order';
   ```
3. Replace `https://your-api-endpoint.vercel.app/api/find-order` with your actual Vercel URL from Step 3
4. Save and commit:
   ```bash
   git add templates/page.find-order.json
   git commit -m "Update API endpoint URL"
   git push origin main
   ```

## Step 5: Deploy to Shopify

After pushing to GitHub, your Shopify GitHub integration should automatically deploy the updated theme. If not, manually push via Shopify CLI or upload the file.

## Testing

1. Go to `https://cookingwithkahnke.com/pages/find-my-order`
2. Enter a valid order number and email
3. Click "Find My Order"
4. You should be redirected to the Shopify order status page

## Troubleshooting

- **401/403 Errors**: Check that your Admin API token has `read_orders` scope enabled
- **CORS Errors**: Verify the API endpoint URL is correct in `page.find-order.json`
- **404 on API**: Check that the function deployed correctly in Vercel dashboard
- **Order not found**: Verify the order number format matches Shopify's format (usually just the number, e.g., "1001" not "#1001")

