# Post-Purchase Upsell Setup Instructions

## Overview
This post-purchase upsell feature displays a special offer on your Shopify order status (thank you) page after customers complete their purchase. It allows customers to add an additional product to their order without leaving the page.

## Installation Steps

### Step 1: Get Your Variant ID (REQUIRED)
The variant ID is the most important piece of information needed. Here are several ways to find it:

**Method 1: From Product Admin Page**
1. Go to your Shopify Admin → **Products**
2. Click on the product you want to use for the upsell
3. Scroll down to the **Variants** section
4. Click on the variant you want to offer
5. Look at the URL: `https://your-store.myshopify.com/admin/products/PRODUCT_ID/variants/VARIANT_ID`
6. Copy the `VARIANT_ID` number (it's a long number like `12345678901234`)

**Method 2: Using Browser Developer Tools**
1. Go to your product page on your storefront
2. Open Developer Tools (F12 or Right-click → Inspect)
3. Go to the **Console** tab
4. Paste this code and press Enter:
```javascript
fetch('/products/YOUR_PRODUCT_HANDLE.js')
  .then(r => r.json())
  .then(data => console.log('Variant ID:', data.variants[0].id));
```
Replace `YOUR_PRODUCT_HANDLE` with your product's handle (from the product URL)

**Method 3: From Product JSON**
1. Visit your product page: `https://your-store.myshopify.com/products/YOUR_PRODUCT_HANDLE.json`
2. Look for the `variants` array
3. Copy the `id` field (numeric ID, not the GID)

### Step 2: Get Product Image URL
1. Go to your product page in Shopify Admin
2. Click on the product image
3. Right-click the full-size image → **Copy image address**
4. Or go to **Settings → Files** and copy the image URL

### Step 3: Configure the Code
1. Open the file `checkout/order-status-upsell.html`
2. Find the `UPSELL_CONFIG` object (around line 38)
3. Update these required fields:
   - `variantId`: Your variant ID from Step 1
   - `productTitle`: Your product name
   - `productImage`: Full URL to your product image
   - `productPrice`: Price as a number or string (e.g., `29.99` or `'29.99'`)
   - `currencyCode`: Your store's currency (USD, EUR, GBP, etc.)

Example:
```javascript
const UPSELL_CONFIG = {
  variantId: '12345678901234',
  productTitle: 'Premium Cooking Set',
  productImage: 'https://cdn.shopify.com/s/files/1/0000/0000/products/image.jpg',
  productPrice: '49.99',
  currencyCode: 'USD',
  // ... other settings
};
```

### Step 5: Paste into Shopify Admin
1. Go to **Shopify Admin → Settings → Checkout**
2. Scroll down to **Order status page**
3. Find the **Additional scripts** section
4. Copy the **entire contents** of `checkout/order-status-upsell.html`
5. Paste it into the **Additional scripts** text area
6. Click **Save**

## Customization Options

### Change Display Delay
Find this line and adjust the milliseconds:
```javascript
showDelay: 2000, // Wait 2 seconds before showing
```

### Change Quantity
Find this line to change how many items are added:
```javascript
quantity: 1 // Change to desired quantity
```

### Customize Styling
The CSS is embedded in the `<style>` section. You can modify:
- Colors (currently using brand green `#234846`)
- Font sizes
- Spacing and padding
- Border radius
- Button styles

### Customize Text
Find these sections in the HTML to change text:
- `"🎉 Special Offer Just For You!"` - Main heading
- `"Add this to your order and save time"` - Subtitle
- `"Add to Order"` - Button text
- `"No thanks, continue"` - Decline button text

## How It Works

1. **Page Load**: When a customer reaches the order status page, the script waits for the configured delay
2. **Product Fetch**: The script attempts to fetch product data from the page or uses configured data
3. **Display**: The upsell appears with product image, title, and price
4. **Add to Cart**: When clicked, it uses Shopify's Cart API (`/cart/add.js`) to add the product
5. **Redirect**: After successful addition, it redirects to checkout to complete the purchase

## Technical Details

### APIs Used
- **Shopify Cart API**: `/cart/add.js` - Adds products to cart via AJAX
- **Shopify Storefront API**: (Optional) For fetching product data

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Works with JavaScript enabled

### Error Handling
- Shows error messages if product can't be added
- Handles network failures gracefully
- Provides retry functionality

## Troubleshooting

### Upsell Not Appearing
1. Check browser console for errors (F12 → Console)
2. Verify PRODUCT_ID is set correctly
3. Ensure the code is saved in Shopify Admin
4. Check that JavaScript is enabled

### Product Not Adding to Cart
1. Verify variant ID is correct
2. Check that the variant is available for sale
3. Ensure the product isn't sold out
4. Check browser console for API errors

### Styling Issues
1. Check if your theme's CSS is conflicting
2. Use browser DevTools to inspect elements
3. Adjust CSS specificity if needed

### Product Data Not Loading
1. Manually configure product data in the code (see Step 4)
2. Or ensure your product pages have JSON-LD structured data

## Testing

1. **Test Order**: Place a test order on your store
2. **Check Thank You Page**: After checkout, verify the upsell appears
3. **Test Button**: Click "Add to Order" and verify it redirects to checkout
4. **Test Decline**: Click "No thanks" and verify it hides the upsell
5. **Mobile Test**: Check on mobile devices to ensure responsive design works

## Notes

- The order status page runs in a sandboxed environment with limited access to Shopify's APIs
- Product data may need to be manually configured
- The code uses vanilla JavaScript (no external libraries)
- All styles are self-contained and won't conflict with your theme
- The upsell only appears once per order status page load

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all IDs are correct (product ID, variant ID)
3. Test with a simple product first
4. Ensure your Shopify plan supports the Cart API

## Future Enhancements

Possible improvements:
- Multiple product upsells
- Discount codes for upsell products
- A/B testing different products
- Analytics tracking
- Conditional display based on order value or products purchased
