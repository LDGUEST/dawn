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
    if (!this.apiEndpoint || this.apiEndpoint === '') {
      this.showError('Order lookup is not configured. Please contact support.');
      this.submitButton.disabled = true;
      return;
    }

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(event) {
    event.preventDefault();

    // Get form data
    const orderNumber = this.form.querySelector('#FindOrderForm-orderNumber').value.trim();
    const email = this.form.querySelector('#FindOrderForm-email').value.trim();

    // Validate
    if (!orderNumber || !email) {
      this.showError('Please fill in all fields.');
      return;
    }

    if (!this.validateEmail(email)) {
      this.showError('Please enter a valid email address.');
      return;
    }

    // Clean order number (remove # if present)
    const cleanOrderNumber = orderNumber.replace(/^#/, '');

    // Disable button during submission
    this.setLoading(true);
    this.hideMessages();
    this.hideResults();

    try {
      const orderData = await this.fetchOrder(cleanOrderNumber, email);
      this.displayResults(orderData);
    } catch (error) {
      console.error('Order lookup error:', error);
      this.showError(error.message || 'Unable to find your order. Please check your order number and email address, or contact support.');
    } finally {
      this.setLoading(false);
    }
  }

  async fetchOrder(orderNumber, email) {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        order_number: orderNumber,
        email: email
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        throw new Error('No order found with that order number and email. Please check your information and try again.');
      } else if (response.status === 400) {
        throw new Error(errorData.message || 'Invalid request. Please check your information.');
      } else if (response.status === 429) {
        throw new Error('Too many requests. Please try again in a moment.');
      } else {
        throw new Error(errorData.message || 'Unable to process your request. Please try again later.');
      }
    }

    return await response.json();
  }

  displayResults(orderData) {
    // Display order details
    if (orderData.order) {
      let detailsHTML = '';
      
      if (orderData.order.name) {
        detailsHTML += `<p><strong>Order Number:</strong> ${this.escapeHtml(orderData.order.name)}</p>`;
      }
      
      if (orderData.order.created_at) {
        const date = new Date(orderData.order.created_at);
        detailsHTML += `<p><strong>Order Date:</strong> ${date.toLocaleDateString()}</p>`;
      }
      
      if (orderData.order.total_price) {
        detailsHTML += `<p><strong>Total:</strong> ${this.escapeHtml(orderData.order.total_price)}</p>`;
      }

      this.detailsElement.innerHTML = detailsHTML;
    }

    // Display download links
    if (orderData.downloads && orderData.downloads.length > 0) {
      let downloadsHTML = '<h4 style="margin-top: 2rem; margin-bottom: 1rem;">Your Downloads:</h4>';
      
      orderData.downloads.forEach((download, index) => {
        downloadsHTML += `
          <div style="margin-bottom: 1.5rem;">
            ${download.name ? `<p><strong>${this.escapeHtml(download.name)}</strong></p>` : ''}
            <a href="${this.escapeHtml(download.url)}" 
               class="find-order-download-link" 
               target="_blank" 
               rel="noopener noreferrer"
               download>
              Download ${download.name || 'File'}
            </a>
          </div>
        `;
      });

      this.downloadsElement.innerHTML = downloadsHTML;
    } else {
      this.downloadsElement.innerHTML = '<p>No download links found for this order. Please contact support if you expected a download.</p>';
    }

    // Show results
    this.resultsElement.classList.add('show');
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

