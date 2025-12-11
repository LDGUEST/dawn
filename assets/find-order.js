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

  async handleSubmit(event) {
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

    // Hide error messages
    this.hideMessages();
    this.hideResults();
    this.setLoading(true);

    try {
      // Call API endpoint if configured, otherwise use direct redirect
      if (this.apiEndpoint) {
        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_number: cleanOrderNum,
            email: email
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Order not found. Please check your order number and email address.');
        }

        const data = await response.json();
        
        if (data.success && data.order_status_url) {
          // Use the guest order status URL from API (no login required)
          this.setLoading(false);
          window.location.href = data.order_status_url;
          return;
        } else if (data.downloads && data.downloads.length > 0) {
          // Display download links directly if API returns them
          this.setLoading(false);
          this.displayDownloads(data.downloads, data.order);
          return;
        } else {
          throw new Error('Order found but no download links available.');
        }
      } else {
        // Fallback: Use Shopify's guest order status page
        // Format: /orders/{order_number}?key={token}
        // Since we don't have token, redirect to order status page which will prompt for email
        this.setLoading(false);
        const orderStatusUrl = `https://cookingwithkahnke.com/orders/${cleanOrderNum}`;
        window.location.href = orderStatusUrl;
      }
    } catch (error) {
      this.setLoading(false);
      this.showError(error.message || 'An error occurred. Please try again or contact support.');
    }
  }

  displayDownloads(downloads, order) {
    // Update results element with success message and download links
    this.resultsElement.style.display = 'block';
    this.resultsElement.classList.add('show');
    
    let orderDetailsHtml = '';
    if (order) {
      orderDetailsHtml = `
        <div style="margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(var(--color-foreground), 0.1);">
          <p style="margin: 0.5rem 0;"><strong>Order:</strong> ${this.escapeHtml(order.name || '')}</p>
          <p style="margin: 0.5rem 0;"><strong>Date:</strong> ${order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</p>
          <p style="margin: 0.5rem 0;"><strong>Total:</strong> ${order.currency || '$'}${order.total_price || ''}</p>
        </div>
      `;
    }

    let downloadsHtml = '';
    if (downloads && downloads.length > 0) {
      downloadsHtml = downloads.map(download => `
        <a href="${this.escapeHtml(download.url)}" 
           class="find-order-download-link" 
           target="_blank"
           rel="noopener noreferrer"
           style="display: inline-block; padding: 15px 32px; background: #005633; color: #fff; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px; margin: 0.5rem 0.5rem 0.5rem 0;">
          Download: ${this.escapeHtml(download.name || 'File')}
        </a>
      `).join('');
    } else {
      downloadsHtml = '<p>No download links found for this order.</p>';
    }

    this.detailsElement.innerHTML = orderDetailsHtml;
    this.downloadsElement.innerHTML = `
      <div style="background: #e8f5e9; border: 1px solid #4caf50; padding: 2rem; border-radius: var(--inputs-radius);">
        <p style="margin: 0 0 15px 0; color: #2e7d32; font-weight: 600; font-size: 1.6rem;">
          ✅ Order Found!
        </p>
        <p style="margin: 0 0 20px 0; color: rgb(var(--color-foreground));">
          Your download links are below:
        </p>
        <div style="margin: 1rem 0;">
          ${downloadsHtml}
        </div>
      </div>
    `;

    // Scroll to results
    this.resultsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  displayOrderStatusLink(orderStatusUrl) {
    // Legacy method - redirects to order status page
    window.location.href = orderStatusUrl;
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

