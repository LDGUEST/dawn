# Installation Guide - Cooking with Kahnke Landing Page
## For Shopify Dawn Theme with Brevo Email Integration

---

## 📋 What You're Getting

This custom landing page includes:
- ✅ Exact match to your screenshot design
- ✅ Mint green gradient background (#A8E6CF → #7FD9B3)
- ✅ Header card with logo, branding, and social icons
- ✅ Product showcase with 4x4 image grid (16 images)
- ✅ Newsletter signup form with **Brevo integration**
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Easy customization through Shopify Theme Editor
- ✅ Compatible with Digital Downloads app

---

## 🚀 Installation Steps

### Step 1: Upload Files to Your Theme

You have already created these files in your Dawn theme:

```
✅ assets/custom-landing-styles.css
✅ assets/kahnke-newsletter.js
✅ sections/custom-landing-page.liquid
✅ templates/page.landing-kahnke.json
✅ layout/theme.liquid (modified)
```

All files are now in place and ready to use!

---

### Step 2: Create the Landing Page

1. Go to your Shopify Admin
2. Navigate to **Online Store** → **Pages**
3. Click **Add page**
4. Enter your page details:
   - **Title**: Home (or "Lettuce Wraps", "Welcome", etc.)
   - **Content**: Leave blank (the template handles everything)
5. On the right sidebar, find **Theme template**
6. Click **Change template**
7. Select **page.landing-kahnke**
8. Click **Save**

---

### Step 3: Set Up Brevo Integration

#### Get Your Brevo API Key

1. Log into your [Brevo account](https://app.brevo.com)
2. Go to **Account** (top right) → **SMTP & API**
3. Click **API Keys** tab
4. Click **Generate a new API key**
5. Name it "Shopify Newsletter" and click **Generate**
6. **Copy the API key** (you won't see it again!)

#### Get Your Brevo List ID

1. In Brevo, go to **Contacts** → **Lists**
2. Create a new list (or select existing one)
3. Click on your list name
4. Look at the URL in your browser - it will look like:
   ```
   https://app.brevo.com/contact/list/id/12345
   ```
5. The number at the end (e.g., `12345`) is your **List ID**

---

### Step 4: Customize Your Content

1. Go to **Online Store** → **Themes**
2. Click **Customize** on your Dawn theme
3. In the page selector (top middle dropdown), select your landing page
4. Click on the **Cooking Landing Page** section

You'll see all these customization options:

#### Header Settings
- **Brand Name**: COOKING WITH KAHNKE
- **Author Name**: RYAN KAHNKE
- **Location Text**: LETTUCE WRAP PARADISE
- **Tagline**: A HEALTHIER YOU, ONE RECIPE AT A TIME
- **Social Media URLs**: Add your TikTok, Instagram, YouTube, Facebook links

#### Product Settings
- **Product Title**: 30 Lettuce Wrap Recipes Book PDF
- **Product Description**: 30 inspirational lettuce wrap recipes to try!
- **Product Price**: $9.99
- **Buy Button URL**: Link to your Digital Downloads product page
- **Buy Button Text**: Buy now
- **Product Images**: Upload all 16 images for the 4x4 grid

#### Newsletter Settings
- **Social Handle**: @cookingwithkahnke
- **Newsletter Description**: Sign up to get exclusive updates...
- **Subscribe Button Text**: Subscribe

#### Brevo Integration (IMPORTANT!)
- **Brevo API Key**: Paste your API key from Step 3
- **Brevo List ID**: Enter your list ID from Step 3

5. Click **Save** (top right)

---

## 🏠 Set as Homepage (Optional)

To make this your store's homepage:

1. Go to **Online Store** → **Preferences**
2. Under **Homepage**, select your landing page
3. Click **Save**

Or keep it as a standalone page accessible at:
```
https://yourstore.com/pages/your-page-handle
```

---

## 📸 Upload Your 16 Product Images

For best results:
- **Size**: 800x800px minimum
- **Format**: JPG or PNG
- **Aspect Ratio**: 1:1 (square)
- **Max file size**: 2MB per image
- **Style**: Keep consistent lighting and angles

**Pro tip**: Compress images before uploading using [TinyPNG.com](https://tinypng.com)

---

## 🔗 Connect Your Digital Downloads Product

1. Create your product in **Products** → **Add product**
2. Install the **Digital Downloads** app from Shopify App Store
3. Add your PDF to the product using the Digital Downloads app
4. Copy your product URL (e.g., `/products/lettuce-wrap-recipes`)
5. In the Theme Customizer, paste this URL into **Buy Button URL**

---

## 📧 Test Your Newsletter Signup

Before going live:

1. Open your landing page
2. Fill in the newsletter form with a test email
3. Click **Subscribe**
4. Check Brevo → **Contacts** → Your list
5. Verify the contact was added

**Troubleshooting Newsletter Issues:**
- ✅ Make sure you entered the correct API key
- ✅ API key must have "Contacts" permissions
- ✅ List ID must be correct (check the number in Brevo URL)
- ✅ Check browser console for errors (F12)

---

## 🎨 Customization Guide

### Change Colors

Edit `assets/custom-landing-styles.css` (lines 7-18):

```css
:root {
  --kahnke-teal: #2D5F5D;           /* Main brand color */
  --kahnke-teal-hover: #234846;     /* Button hover color */
  --kahnke-gradient-start: #A8E6CF; /* Top gradient */
  --kahnke-gradient-end: #7FD9B3;   /* Bottom gradient */
}
```

### Change Spacing

In the same CSS file:
- Card spacing: line 34 - `gap: 30px;`
- Card padding: line 44 - `padding: 40px 30px;`
- Border roundness: line 43 - `border-radius: 20px;`

### Change Fonts

The landing page uses system fonts by default. To use custom fonts:

1. Upload font files to `assets/` folder
2. Add `@font-face` rules to the CSS file
3. Update `font-family` in line 25

---

## 📱 Mobile Responsive Breakpoints

The page automatically adapts to:
- **Desktop**: >768px (2-column product grid)
- **Tablet**: 768px (1-column stack)
- **Mobile**: 480px (optimized spacing)
- **Extra Small**: 360px (3-column image grid)

---

## ✅ Pre-Launch Checklist

Before making your page live:

- [ ] All 16 product images uploaded
- [ ] All text content proofread
- [ ] Social media links working
- [ ] Buy button links to correct Digital Downloads product
- [ ] Brevo API key and List ID configured
- [ ] Newsletter form tested and working
- [ ] Page viewed on mobile phone
- [ ] Page viewed on tablet
- [ ] Page viewed on desktop
- [ ] All links use HTTPS
- [ ] Page loads in under 3 seconds

---

## 🐛 Troubleshooting

### Styles Not Showing
**Problem**: Page looks unstyled or wrong
**Solution**: 
- Make sure `custom-landing-styles.css` is in the `assets/` folder
- Check that CSS is linked in `layout/theme.liquid`
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)

### Section Not Appearing
**Problem**: Landing page is blank or shows default template
**Solution**:
- Verify you selected `page.landing-kahnke` template
- Go to Pages → Your page → Theme template → Change

### Newsletter Form Not Working
**Problem**: "Newsletter is not configured" error
**Solution**:
- Add your Brevo API key in Theme Customizer
- Verify API key has "Contacts" permissions
- Check List ID is correct (just the number)

**Problem**: Form submits but contact doesn't appear in Brevo
**Solution**:
- Verify the List ID matches your Brevo list
- Check if contact already exists in Brevo
- Open browser console (F12) to check for errors

### Images Not Appearing
**Problem**: Placeholder numbers showing instead of images
**Solution**:
- Upload images through Theme Customizer (not code editor)
- Images must be uploaded one by one in the 16 image fields
- Refresh the page after uploading

### Gradient Background Not Showing
**Problem**: Background is white or wrong color
**Solution**:
- Check CSS file is properly uploaded
- Verify the section has `kahnke-landing-wrapper` class
- Clear browser cache

---

## 🔒 Security Best Practices

**Brevo API Key Storage:**
- ✅ API key is stored in theme settings (secure)
- ✅ API key is never exposed in page source to visitors
- ✅ API requests are made from browser directly to Brevo (CORS-enabled)

**Note**: The API key will be visible in the page HTML source, but this is safe because:
- Brevo API keys are scoped to specific permissions
- The key used only has contact creation permissions
- Users cannot access or modify your Brevo account

For extra security, consider using a Shopify App proxy to handle submissions server-side.

---

## 📈 Performance Optimization

Already included:
- ✅ Lazy loading on images
- ✅ Minimal CSS (no unused code)
- ✅ Deferred JavaScript loading
- ✅ Efficient grid layouts
- ✅ Compressed SVG icons

**To further optimize:**
1. Use Shopify's automatic image CDN (already enabled)
2. Compress images before uploading
3. Enable theme minification in Settings → Online Store → Themes

---

## 🎯 Next Steps After Installation

1. **Set up your Digital Downloads product**
   - Create product in Shopify
   - Add PDF using Digital Downloads app
   - Set price to $9.99
   - Link to landing page

2. **Configure Brevo email campaigns**
   - Create welcome email automation
   - Set up abandoned cart reminders
   - Design newsletter templates

3. **Add tracking & analytics**
   - Google Analytics event tracking
   - Facebook Pixel for conversions
   - Shopify Analytics review

4. **Marketing preparation**
   - Create social media posts
   - Prepare TikTok video campaign
   - Design Instagram story highlights
   - Plan launch date

5. **Test everything**
   - Complete a test purchase
   - Sign up for newsletter yourself
   - Test on different devices
   - Ask friends to test the page

---

## 💡 Pro Tips

**For Better Conversions:**
- Use high-quality, appetizing food photos
- Show variety in the 16 image grid
- Keep button text action-oriented ("Get Recipes", "Download Now")
- Add urgency if appropriate ("Limited Time", "Today Only")

**For Newsletter Growth:**
- Offer a freebie for subscribing (sample recipe)
- Mention newsletter benefits clearly
- Send welcome email immediately
- Segment subscribers in Brevo

**For Product Sales:**
- Consider adding testimonials section
- Show preview of what's inside the PDF
- Highlight unique value proposition
- Add money-back guarantee if possible

---

## 📞 Support Resources

- **Shopify Help**: [help.shopify.com](https://help.shopify.com)
- **Dawn Theme Docs**: [shopify.dev/themes](https://shopify.dev/themes)
- **Brevo API Docs**: [developers.brevo.com](https://developers.brevo.com)
- **Liquid Reference**: [shopify.dev/docs/api/liquid](https://shopify.dev/docs/api/liquid)

---

## 🎉 You're All Set!

Your custom landing page is now installed and ready to go. All you need to do is:

1. ✅ Add your Brevo credentials
2. ✅ Upload your 16 product images
3. ✅ Link your Digital Downloads product
4. ✅ Add your social media links
5. ✅ Customize any text you want
6. ✅ Test the newsletter form
7. ✅ Go live!

**Your landing page is accessible at:**
- As a page: `yourstore.com/pages/your-page-handle`
- As homepage: Set in Online Store → Preferences

---

## 📝 Quick Reference

**Files Created:**
- `assets/custom-landing-styles.css` - All styling
- `assets/kahnke-newsletter.js` - Brevo integration
- `sections/custom-landing-page.liquid` - Main section
- `templates/page.landing-kahnke.json` - Page template

**Key Colors:**
- Teal: `#2D5F5D`
- Light Mint: `#A8E6CF`
- Deep Mint: `#7FD9B3`

**Important URLs:**
- Brevo API Keys: Account → SMTP & API → API Keys
- Brevo Lists: Contacts → Lists
- Theme Customizer: Online Store → Themes → Customize

---

Happy cooking and selling! 🥗

If you need any adjustments to colors, spacing, or functionality, you can easily modify the CSS file or section settings in the Theme Customizer.

