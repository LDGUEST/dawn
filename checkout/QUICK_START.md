# Quick Start Guide - Post-Purchase Upsell

## 5-Minute Setup

### 1. Find Your Variant ID
- Go to: **Products → Your Product → Variants**
- Click on the variant → Check URL: `/admin/products/XXX/variants/VARIANT_ID`
- Copy the numeric `VARIANT_ID`

### 2. Configure the Code
Open `checkout/order-status-upsell.html` and update these 5 values:

```javascript
const UPSELL_CONFIG = {
  variantId: '12345678901234',        // ← Your variant ID
  productTitle: 'Your Product Name',  // ← Product name
  productImage: 'https://...',        // ← Full image URL
  productPrice: '29.99',              // ← Price
  currencyCode: 'USD',                // ← Currency
};
```

### 3. Copy & Paste
1. Copy **entire contents** of `checkout/order-status-upsell.html`
2. Go to: **Shopify Admin → Settings → Checkout → Order status page**
3. Paste into **Additional scripts** section
4. Click **Save**

### 4. Test
1. Place a test order
2. Check the thank you page
3. Verify upsell appears and works

## Common Issues

**Upsell not showing?**
- Check browser console (F12) for errors
- Verify variant ID is correct
- Ensure code is saved in Shopify Admin

**Product not adding?**
- Verify variant ID is correct and numeric
- Check variant is available for sale
- Ensure product isn't sold out

## Need Help?
See `UPSELL_SETUP_INSTRUCTIONS.md` for detailed instructions.
