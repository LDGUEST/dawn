# Local Testing Guide

## Quick Test Setup

### Option 1: Standalone Test Page (Recommended)

1. **Open the test page:**
   - Open `checkout/test-upsell-local.html` in your browser
   - Or serve it with a local server (see below)

2. **Configure the upsell code:**
   - Open `checkout/order-status-upsell.html`
   - Update the `UPSELL_CONFIG` with test values:
     ```javascript
     const UPSELL_CONFIG = {
       variantId: '12345678901234',  // Use a test variant ID
       productTitle: 'Test Product',
       productImage: 'https://via.placeholder.com/400x400?text=Test+Product',
       productPrice: '29.99',
       currencyCode: 'USD',
       // ... other settings
     };
     ```

3. **Copy and paste:**
   - Copy the entire contents of `checkout/order-status-upsell.html`
   - Paste it into `checkout/test-upsell-local.html` where indicated (before `</body>`)
   - Save and refresh the browser

### Option 2: Using a Local Server

For better testing (especially for API calls), use a local server:

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Using Node.js (http-server):**
```bash
npx http-server -p 8000
```

**Using PHP:**
```bash
php -S localhost:8000
```

Then visit: `http://localhost:8000/checkout/test-upsell-local.html`

## Testing Checklist

- [ ] Upsell appears after 2 seconds
- [ ] Product image displays correctly
- [ ] Product title and price show correctly
- [ ] "Add to Order" button is clickable
- [ ] Loading spinner appears when clicked
- [ ] Success message appears (in test mode)
- [ ] "No thanks" button hides the upsell
- [ ] Mobile responsive design works
- [ ] Error handling works (try invalid variant ID)

## Test Mode Features

The test page includes a mock Shopify Cart API that:
- Intercepts `/cart/add.js` requests
- Returns a simulated success response
- Logs requests to console
- Allows UI testing without actual cart operations

## Testing Real Cart Integration

To test with your actual Shopify store:

1. **Deploy to Shopify:**
   - Copy the configured code from `order-status-upsell.html`
   - Paste into: Shopify Admin → Settings → Checkout → Order status page → Additional scripts
   - Save

2. **Test with real order:**
   - Place a test order on your store
   - Complete checkout
   - Verify upsell appears on thank you page
   - Test "Add to Order" button (should redirect to checkout)

## Troubleshooting

**Upsell not appearing:**
- Check browser console (F12) for errors
- Verify variant ID is configured
- Check that code is pasted correctly

**Cart API not working:**
- In test mode, it's mocked (check console)
- On real Shopify page, ensure you're on your store domain
- Check that variant ID is valid and product is available

**Styling issues:**
- Check browser DevTools for CSS conflicts
- Verify all styles are included in the code
- Test on different browsers

## Next Steps

After local testing:
1. Configure with real product data
2. Deploy to Shopify order status page
3. Test with real orders
4. Monitor for errors
5. Adjust timing/styling as needed
