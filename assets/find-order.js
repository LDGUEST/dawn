/**
 * Find Order - Order Lookup Handler
 * Handles form submission and API communication for order lookup
 */

class FindOrder {
  constructor(formElement) {
    this.form = formElement;
    this.submitButton = formElement.querySelector('#FindOrderSubmit');
    this.loadingElement = document.getElementById('FindOrderLoading');
    this.errorElement = document.getElementById('FindOrderError');
    this.resultsElement = document.getElementById('FindOrderResults');
    this.detailsElement = document.getElementById('FindOrderDetails');
    this.downloadsElement = document.getElementById('FindOrderDownloads');
    this.apiEndpoint = formElement.dataset.apiEndpoint;
    
    this.init();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  handleSubmit(event) {
    event.preventDefault();

    // Get form data
    const orderNumber = this.form.querySelector('#FindOrderForm-orderNumber').value.trim();
    const email = this.form.querySelector('#FindOrderForm-email').value.trim();

    // Validation
    if (!orderNumber || !email) {
      this.showError('Please fill in both fields.');
      return;
    }

    if (!this.validateEmail(email)) {
      this.showError('Please enter a valid email address.');
      return;
    }

    // Clean the order number (remove # and spaces if present)
    const cleanOrderNum = orderNumber.replace(/[#\s]/g, '');

    // Generate Shopify Order Status URL
    const orderStatusUrl = `https://cookingwithkahnke.com/${cleanOrderNum}/orders`;

    // Hide error messages
    this.hideMessages();
    this.hideResults();

    // Display success with link
    this.displayOrderStatusLink(orderStatusUrl);
  }

  displayOrderStatusLink(orderStatusUrl) {
    // Update results element with success message and link
    this.resultsElement.style.display = 'block';
    this.resultsElement.classList.add('show');
    
    this.detailsElement.innerHTML = '';
    this.downloadsElement.innerHTML = `
      <div style="background: #e8f5e9; border: 1px solid #4caf50; padding: 2rem; border-radius: var(--inputs-radius);">
        <p style="margin: 0 0 15px 0; color: #2e7d32; font-weight: 600; font-size: 1.6rem;">
          ✅ Order Found!
        </p>
        <p style="margin: 0 0 20px 0; color: rgb(var(--color-foreground));">
          Click below to view your order and access your downloads:
        </p>
        <a href="${this.escapeHtml(orderStatusUrl)}" 
           class="find-order-download-link" 
           style="display: inline-block; padding: 15px 32px; background: #005633; color: #fff; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px; margin-bottom: 15px;">
          View My Order & Downloads
        </a>
        <p style="margin: 20px 0 0 0; font-size: 14px; color: rgba(var(--color-foreground), 0.7);">
          You may need to verify your email address on the next page.
        </p>
      </div>
    `;

    // Scroll to results
    this.resultsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  setLoading(isLoading) {
    this.submitButton.disabled = isLoading;
    this.submitButton.textContent = isLoading ? 'Searching...' : 'Find My Order';
    
    if (isLoading) {
      this.loadingElement.classList.add('show');
    } else {
      this.loadingElement.classList.remove('show');
    }
  }

  displayResults(orderData) {
    // Legacy method - kept for compatibility but not used with new implementation
    this.displayOrderStatusLink('');
  }

  hideMessages() {
    this.errorElement.classList.remove('show');
    this.errorElement.textContent = '';
  }

  hideResults() {
    this.resultsElement.classList.remove('show');
    this.detailsElement.innerHTML = '';
    this.downloadsElement.innerHTML = '';
  }

  showError(message) {
    this.errorElement.textContent = message;
    this.errorElement.classList.add('show');
    this.errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const findOrderForm = document.getElementById('FindOrderForm');
  
  if (findOrderForm) {
    new FindOrder(findOrderForm);
  }
});

