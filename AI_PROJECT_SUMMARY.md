# Project Summary: Cooking with Kahnke - Shopify Dawn Theme Customization

## 🎯 Project Overview

This is a **heavily customized Shopify Dawn theme** (v15.4.0) for "Cooking with Kahnke" - a health/recipe brand focused on lettuce wrap recipes. The theme has been extensively modified with custom landing pages, product page enhancements, email popup modals, and site-wide styling changes.

**Repository**: `C:\Users\Admin\dawn`  
**Base Theme**: Shopify Dawn 15.4.0  
**Primary Use Case**: Digital product sales (PDF cookbooks) with email list building

---

## 🏗️ Architecture & Structure

### Core Theme Structure
```
dawn/
├── assets/              # CSS, JS, images, SVG icons
├── config/              # Theme settings (settings_data.json, settings_schema.json)
├── layout/              # Theme layout files (theme.liquid, password.liquid)
├── sections/            # Reusable page sections (Liquid templates)
├── snippets/            # Reusable code snippets (Liquid templates)
├── templates/           # Page templates (JSON/Liquid)
└── locales/            # Translation files (multi-language support)
```

### Key Custom Files

**Custom Landing Page:**
- `sections/custom-landing-page.liquid` - Main landing page section
- `templates/page.landing-kahnke.json` - Landing page template config
- `assets/custom-landing-styles.css` - All custom styling (800+ lines)
- `assets/kahnke-newsletter.js` - Newsletter form JavaScript

**Email Popup Modal:**
- `snippets/email-popup-modal.liquid` - Email capture popup with form

**Product Page Enhancements:**
- `assets/section-main-product.css` - Product page customizations
- `sections/main-product.liquid` - Modified product template

**Header/Footer:**
- `sections/header.liquid` - Customized header (account icon moved, search removed)
- `sections/footer.liquid` - Footer modifications

---

## 🎨 Brand Colors & Design System

### Primary Color Scheme
- **Brand Green (Primary)**: `#005633` (used for ALL buttons site-wide)
- **Brand Green Hover**: `#004428` (darker shade for hover states)
- **Brand Green Active**: `#00331f` (darkest shade for active states)
- **Dark Green Text**: `#234846` (used for descriptions, high contrast)
- **Gradient Background**: `linear-gradient(180deg, #02891e 0%, #FFFFFF 50%, #02891e 100%)`
  - Applied to: Homepage, Product pages, Checkout pages

### Typography
- **Font Family**: System font stack (Apple, Segoe UI, Roboto, etc.)
- **Font Weights**: 500-800 (semi-bold to extra-bold)
- **Line Heights**: 1.6-1.7 for body text
- **Font Sizes**: Responsive, typically 1.5rem-1.7rem for body text

### Button Styling
- **All buttons** use `#005633` as background color
- **Hover state**: `#004428`
- **Active state**: `#00331f`
- **Text color**: `#FFFFFF` (white)
- **Font weight**: 700 (bold)
- **Letter spacing**: 0

---

## 🔧 Major Customizations

### 1. Custom Landing Page (`sections/custom-landing-page.liquid`)
**Purpose**: Main homepage with product showcase and newsletter signup

**Features:**
- Customizable header with logo, brand name, author, location, tagline
- Social media icons (TikTok, Instagram, YouTube, Facebook)
- Product showcase section with title, description, price
- 4x4 product image grid (16 images, now configurable as single image)
- Newsletter signup form (integrated with Shopify Customers)
- Fully responsive design
- Customizable gradient background
- Adjustable card borders (thickness and color)
- Spacing controls (top/bottom padding)

**Settings Available:**
- Logo/image upload with size control
- Text fields for all content
- Social media URLs
- Product information
- Buy button URL and text
- Newsletter form customization
- Border and spacing controls

### 2. Email Popup Modal (`snippets/email-popup-modal.liquid`)
**Purpose**: Email capture popup that appears on homepage

**Features:**
- Dark overlay background (90% opacity black)
- Centered modal with white background
- First name and email input fields
- Subscribe button
- Close functionality:
  - X button in top-right corner
  - Click outside modal (on overlay) to close
  - Escape key to close (desktop)
- Form validation
- Success/error messaging
- Integrated with Shopify Customers API
- Auto-tags subscribers with "newsletter" tag

**Styling:**
- Blur effect on background (`backdrop-filter: blur(5px)`)
- Rounded corners (24px border radius)
- Custom border (3px solid black)
- Responsive sizing

### 3. Product Page Enhancements

**Direct-to-Checkout Flow:**
- "Buy Now" button (formerly "Add to Cart") redirects directly to `/checkout`
- No cart page intermediate step
- Button text changed to "Buy now" (lowercase 'n')
- Form includes `return_to=/checkout` parameter

**Styling:**
- Button color: `#005633` (brand green)
- Bold font weight (700)
- Zero letter spacing
- Gradient background on product page
- Description text styling:
  - Color: `#234846` (dark green for contrast)
  - Font weight: 500 (semi-bold)
  - Font size: 1.7rem
  - Line height: 1.7
  - Paragraph spacing: `1em` bottom margin

**Accordion/Description Section:**
- Collapsible tabs for product information
- Description text styled for readability on gradient background
- Proper spacing between paragraphs

### 4. Header Modifications (`sections/header.liquid`)

**Changes Made:**
- **Account icon moved to left side** (next to logo, with 2rem margin-left)
- **Search icon removed** (commented out in code, hidden via CSS)
- **Account icon hidden on homepage only** (visible on all other pages)
- Logo size adjustable via theme settings

**CSS Classes:**
- `.header__icon--left` - Account icon on left side
- `.header__icon--search` - Hidden via CSS

### 5. Site-Wide Styling

**Force Light Mode:**
- `layout/theme.liquid`: Added `color-scheme: light` to `<html>` tag
- `assets/base.css`: Added `color-scheme: light only;` to `:root`, `html`, and `body`
- Prevents browser/system dark mode from affecting the site

**Global Button Override:**
- `assets/custom-landing-styles.css`: Global CSS rules to force all primary buttons to `#005633`
- Targets: `.button`, `.product-form__submit`, `.cart__checkout-button`, `.shopify-payment-button__button--unbranded`
- Excludes secondary and tertiary buttons

**Gradient Backgrounds:**
- Applied to: Homepage, Product pages, Checkout pages
- Gradient: `linear-gradient(180deg, #02891e 0%, #FFFFFF 50%, #02891e 100%)`
- Green at top/bottom, white in middle

### 6. Floating Cart Button (`snippets/floating-cart.liquid`)
**Purpose**: Persistent cart button in top-right corner

**Features:**
- Only appears when `cart.item_count > 0`
- Fixed position (top: 20px, right: 20px)
- Circular button with cart icon
- Shows item count badge
- Background: `#005633` (brand green)
- Links to `/cart` page
- High z-index (1000) to stay above content

---

## 📁 Key Files Reference

### CSS Files
- `assets/custom-landing-styles.css` - **Main custom stylesheet** (800+ lines)
  - Landing page styles
  - Email popup modal styles
  - Floating cart button
  - Global button overrides
  - CSS variables for colors
  - Responsive breakpoints

- `assets/section-main-product.css` - Product page customizations
  - Buy Now button styling
  - Product description text styling
  - Paragraph spacing

- `assets/base.css` - Theme base styles (modified for light mode)

- `assets/component-accordion.css` - Accordion/collapsible content styling

### Liquid Templates
- `sections/custom-landing-page.liquid` - Landing page section
- `sections/main-product.liquid` - Product page template
- `sections/header.liquid` - Header with navigation
- `snippets/email-popup-modal.liquid` - Email popup modal
- `snippets/floating-cart.liquid` - Floating cart button
- `layout/theme.liquid` - Main theme layout (modified for light mode)

### JavaScript Files
- `assets/kahnke-newsletter.js` - Newsletter form handling
- `assets/product-form.js` - Product form modifications (direct-to-checkout)

### Configuration
- `config/settings_data.json` - Current theme settings (button colors, etc.)
- `config/settings_schema.json` - Theme settings schema definitions
- `templates/page.landing-kahnke.json` - Landing page template config
- `templates/product.json` - Product page template config
- `templates/index.json` - Homepage template config

---

## 🎯 Key Features & Functionality

### 1. Direct-to-Checkout Flow
- Products skip cart page entirely
- "Buy Now" button redirects to `/checkout` immediately
- Form includes `return_to=/checkout` parameter
- JavaScript handles immediate redirect after adding to cart

### 2. Email List Building
- Newsletter signup on landing page
- Email popup modal on homepage
- Subscribers added to Shopify Customers with "newsletter" tag
- Form validation (first name + email required)
- Success/error messaging

### 3. Customizable Landing Page
- Fully editable via Shopify Theme Customizer
- No coding required for content updates
- Image uploads for logo and product images
- Text fields for all content
- Social media link management
- Border and spacing controls

### 4. Responsive Design
- Mobile-first approach
- Breakpoints: 360px, 480px, 768px, 1200px
- Touch-friendly tap targets (minimum 44x44px)
- Optimized images and lazy loading
- Flexible grid layouts

### 5. Performance Optimizations
- Lazy loading images
- Deferred JavaScript
- Minimal CSS (no unused code)
- Compressed SVG icons
- Efficient grid layouts

---

## 🔄 Git Workflow & Version Control

**Current Branch**: `main`  
**Remote**: `https://github.com/LDGUEST/dawn.git`

**Important Notes:**
- Changes are pushed directly to `main` branch
- Shopify syncs changes automatically (1-2 minute delay)
- Some files are auto-generated by Shopify (marked in comments)
- Always pull before pushing if remote has changes

**Recent Major Commits:**
- Button color changes to `#005633`
- Product description paragraph spacing
- Email popup modal click-outside fix
- Header modifications (account icon, search removal)
- Direct-to-checkout implementation

---

## 🛠️ Development Patterns

### CSS Organization
- Custom styles in `assets/custom-landing-styles.css`
- Component-specific styles in respective CSS files
- Use `!important` sparingly (only when overriding theme defaults)
- CSS variables for easy color customization

### Liquid Template Structure
- Sections: Reusable page sections with schema settings
- Snippets: Smaller reusable components
- Templates: Page-level configurations (JSON) or full templates (Liquid)

### JavaScript Patterns
- Vanilla JavaScript (no jQuery)
- Event delegation where possible
- Error handling for API calls
- Form validation before submission

### Color Management
- Primary brand color: `#005633` (all buttons)
- Dark green text: `#234846` (high contrast)
- Gradient: `#02891e` to `#FFFFFF` to `#02891e`
- CSS variables defined in `:root` for easy updates

---

## ⚠️ Important Considerations

### Auto-Generated Files
Some files are auto-generated by Shopify and may be overwritten:
- `templates/*.json` files (marked with comments)
- `config/settings_data.json` (can be modified but may sync from Shopify)

### Theme Updates
- **DO NOT** update Dawn theme from Shopify theme store
- Customizations will be lost
- Maintain custom files separately
- Document all modifications

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Uses modern CSS (backdrop-filter, CSS Grid, Flexbox)

### Performance
- Images should be optimized before upload
- Use Shopify's image CDN (automatic)
- Test with Google PageSpeed Insights
- Aim for <3 second load time

---

## 🐛 Common Issues & Solutions

### Styling Not Applying
1. Clear browser cache (Ctrl+Shift+R)
2. Wait 1-2 minutes for Shopify sync
3. Check CSS file is in `assets/` folder
4. Verify CSS is loaded in browser DevTools

### Buttons Not Green
- Check `assets/custom-landing-styles.css` global button override
- Verify `config/settings_data.json` button color is `#005633`
- Check for conflicting CSS rules

### Email Popup Not Closing
- Verify JavaScript in `snippets/email-popup-modal.liquid`
- Check overlay has `pointer-events: all`
- Test X button, click outside, and Escape key

### Product Description Spacing
- Check `assets/section-main-product.css` paragraph margin
- Should be `margin: 0 0 1em 0;` for `.product__description.rte p`

---

## 📝 Customization Guide

### Changing Button Colors
1. Update `assets/custom-landing-styles.css` global button override
2. Update `config/settings_data.json` button color in all color schemes
3. Update CSS variables in `:root` if using variables

### Modifying Landing Page
1. Edit `sections/custom-landing-page.liquid` for structure
2. Edit `assets/custom-landing-styles.css` for styling
3. Use Theme Customizer for content (no code needed)

### Adding New Sections
1. Create new file in `sections/` folder
2. Add schema settings for customization
3. Include in template JSON files
4. Add CSS to appropriate stylesheet

### Modifying Product Page
1. Edit `sections/main-product.liquid` for structure
2. Edit `assets/section-main-product.css` for styling
3. Edit `assets/product-form.js` for form behavior

---

## 🎓 Technical Stack

- **Theme Base**: Shopify Dawn 15.4.0
- **Templating**: Liquid (Shopify's template language)
- **Styling**: CSS3 (with CSS variables)
- **JavaScript**: Vanilla ES6+
- **Version Control**: Git
- **Hosting**: Shopify (automatic)

---

## 📚 Documentation Files

- `README.md` - Project overview and quick start
- `QUICK_START.md` - 3-step setup guide
- `INSTALLATION.md` - Complete installation instructions
- `PROJECT_SUMMARY.md` - Implementation summary
- `AI_PROJECT_SUMMARY.md` - This file (for AI assistants)

---

## 🚀 Quick Reference

### Most Modified Files
1. `assets/custom-landing-styles.css` - All custom styling
2. `sections/custom-landing-page.liquid` - Landing page
3. `sections/main-product.liquid` - Product page
4. `sections/header.liquid` - Header modifications
5. `snippets/email-popup-modal.liquid` - Email popup

### Key CSS Classes
- `.kahnke-landing-wrapper` - Landing page container
- `.kahnke-buy-button` - Buy button on landing page
- `.kahnke-subscribe-button` - Newsletter subscribe button
- `.email-popup-modal` - Email popup container
- `.product-form__submit` - Product page Buy Now button
- `.floating-cart-button` - Floating cart button

### Key Color Values
- Primary: `#005633`
- Hover: `#004428`
- Active: `#00331f`
- Text Dark: `#234846`
- Gradient Start: `#02891e`
- Gradient End: `#FFFFFF`

---

## ✅ Current State

**All systems operational:**
- ✅ Landing page fully functional
- ✅ Product pages with direct-to-checkout
- ✅ Email popup modal working
- ✅ All buttons using brand green (`#005633`)
- ✅ Gradient backgrounds applied
- ✅ Header modifications complete
- ✅ Responsive design implemented
- ✅ Light mode forced site-wide

**Ready for:**
- Content updates via Theme Customizer
- Product additions
- Email list building
- Digital product sales

---

## 🔗 Important Links

- **Shopify Theme Docs**: https://shopify.dev/themes
- **Liquid Docs**: https://shopify.dev/docs/api/liquid
- **Dawn Theme GitHub**: https://github.com/Shopify/dawn
- **Shopify Admin**: (Store-specific URL)

---

**Last Updated**: Based on current codebase state  
**Theme Version**: Dawn 15.4.0  
**Customization Level**: Heavy (extensive modifications)

This summary provides a comprehensive overview for any AI assistant working on this project. All key files, patterns, and customizations are documented for easy reference.

