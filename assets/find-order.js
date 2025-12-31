/**
 * Find Order - Order Lookup Handler
 * Handles form submission and API communication for order lookup
 * Version: 2.0 - Fixed 404 redirect issue
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
    // Get API endpoint from data attribute (kebab-case converts to camelCase)
    // Fallback to hardcoded endpoint if not set in theme settings
    this.apiEndpoint =
      formElement.dataset.apiEndpoint ||
      formElement.getAttribute('data-api-endpoint') ||
      'https://shopify-order-lookup.cookingwithkahnke.workers.dev';

    // Debug logging
    console.log('FindOrder initialized:', {
      hasApiEndpoint: !!this.apiEndpoint,
      apiEndpoint: this.apiEndpoint ? this.apiEndpoint.substring(0, 50) + '...' : 'NOT SET',
      formDataAttributes: Array.from(formElement.attributes).filter((attr) => attr.name.startsWith('data-')),
    });

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

    // Debug logging - what we're sending
    console.log('🔍 FindOrder - Sending request:', {
      originalOrderNumber: orderNumber,
      cleanedOrderNumber: cleanOrderNum,
      email: email,
      apiEndpoint: this.apiEndpoint
    });

    // Hide error messages
    this.hideMessages();
    this.hideResults();
    this.setLoading(true);

    try {
      // Call API endpoint if configured, otherwise use direct redirect
      if (this.apiEndpoint) {
        const requestBody = {
          order_number: cleanOrderNum,
          email: email.trim().toLowerCase(),
        };
        
        console.log('📤 FindOrder - API Request:', {
          url: this.apiEndpoint,
          method: 'POST',
          body: requestBody
        });

        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('📥 FindOrder - API Response status:', response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ FindOrder - API Error:', {
            status: response.status,
            statusText: response.statusText,
            errorData: errorData
          });
          throw new Error(errorData.message || 'Order not found. Please check your order number and email address.');
        }

        const data = await response.json();
        console.log('✅ FindOrder - API Success:', {
          success: data.success,
          hasOrder: !!data.order,
          hasDownloads: !!(data.downloads && data.downloads.length > 0),
          orderName: data.order?.name,
          downloadCount: data.downloads?.length || 0
        });

        // Debug logging (remove in production if needed)
        console.log('API Response:', {
          success: data.success,
          hasDownloads: !!(data.downloads && data.downloads.length > 0),
          hasOrderStatusUrl: !!data.order_status_url,
          orderStatusUrl: data.order_status_url,
        });

        if (data.success) {
          // Always display results on the page instead of redirecting
          // This avoids 404 errors and provides a better user experience
          this.setLoading(false);

          if (data.downloads && data.downloads.length > 0) {
            // Display download links if available
            this.displayDownloads(data.downloads, data.order, data.order_status_url);
          } else if (data.order_status_url) {
            // If no downloads but we have order status URL, show order details with link
            // IMPORTANT: We display as a link, NOT redirect, to avoid 404 errors
            this.displayOrderWithStatusLink(data.order, data.order_status_url);
          } else {
            // Just show order details
            this.displayOrderDetails(data.order);
          }
          return;
        } else {
          throw new Error('Order found but no information available.');
        }
      } else {
        // Fallback: No API endpoint configured - show error
        this.setLoading(false);
        console.error('API endpoint not configured. Form element:', {
          dataset: this.form.dataset,
          attributes: Array.from(this.form.attributes).map((attr) => ({ name: attr.name, value: attr.value })),
        });
        this.showError('Order lookup service is not configured. Please contact support for assistance.');
      }
    } catch (error) {
      this.setLoading(false);
      this.showError(error.message || 'An error occurred. Please try again or contact support.');
    }
  }

  displayDownloads(downloads, order, orderStatusUrl = null) {
    // Update results element with success message and download links
    this.resultsElement.style.display = 'block';
    this.resultsElement.classList.add('show');

    let orderDetailsHtml = '';
    if (order) {
      orderDetailsHtml = `
        <div style="margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(var(--color-foreground), 0.1);">
          <p style="margin: 0.5rem 0;"><strong>Order:</strong> ${this.escapeHtml(order.name || '')}</p>
          <p style="margin: 0.5rem 0;"><strong>Date:</strong> ${
            order.created_at ? new Date(order.created_at).toLocaleDateString() : ''
          }</p>
          <p style="margin: 0.5rem 0;"><strong>Total:</strong> ${order.currency || '$'}${order.total_price || ''}</p>
        </div>
      `;
    }

    let downloadsHtml = '';
    if (downloads && downloads.length > 0) {
      downloadsHtml = downloads
        .map(
          (download) => `
        <a href="${this.escapeHtml(download.url)}" 
           class="find-order-download-link" 
           target="_blank"
           rel="noopener noreferrer"
           style="display: inline-block; padding: 15px 32px; background: #005633; color: #fff; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px; margin: 0.5rem 0.5rem 0.5rem 0;">
          Download: ${this.escapeHtml(download.name || 'File')}
        </a>
      `
        )
        .join('');
    } else {
      downloadsHtml = '<p>No download links found for this order.</p>';
    }

    // Add order status link if available
    let statusLinkHtml = '';
    if (orderStatusUrl) {
      statusLinkHtml = `
        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(var(--color-foreground), 0.1);">
          <a href="${this.escapeHtml(orderStatusUrl)}" 
             class="find-order-download-link" 
             target="_blank"
             rel="noopener noreferrer"
             style="display: inline-block; padding: 15px 32px; background: #6c757d; color: #fff; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px; margin: 0.5rem 0.5rem 0.5rem 0;">
            View Full Order Status
          </a>
        </div>
      `;
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
        ${statusLinkHtml}
      </div>
    `;

    // Scroll to results
    this.resultsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  displayOrderWithStatusLink(order, orderStatusUrl) {
    // Display order details with a link to the order status page
    this.resultsElement.style.display = 'block';
    this.resultsElement.classList.add('show');

    let orderDetailsHtml = '';
    if (order) {
      orderDetailsHtml = `
        <div style="margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(var(--color-foreground), 0.1);">
          <p style="margin: 0.5rem 0;"><strong>Order:</strong> ${this.escapeHtml(order.name || '')}</p>
          <p style="margin: 0.5rem 0;"><strong>Date:</strong> ${
            order.created_at ? new Date(order.created_at).toLocaleDateString() : ''
          }</p>
          <p style="margin: 0.5rem 0;"><strong>Total:</strong> ${order.currency || '$'}${order.total_price || ''}</p>
        </div>
      `;
    }

    this.detailsElement.innerHTML = orderDetailsHtml;
    this.downloadsElement.innerHTML = `
      <div style="background: #e8f5e9; border: 1px solid #4caf50; padding: 2rem; border-radius: var(--inputs-radius);">
        <p style="margin: 0 0 15px 0; color: #2e7d32; font-weight: 600; font-size: 1.6rem;">
          ✅ Order Found!
        </p>
        <p style="margin: 0 0 20px 0; color: rgb(var(--color-foreground));">
          ${
            orderStatusUrl
              ? 'Click the link below to view your order status and download links:'
              : 'Your order has been found.'
          }
        </p>
        ${
          orderStatusUrl
            ? `
          <a href="${this.escapeHtml(orderStatusUrl)}" 
             class="find-order-download-link" 
             target="_blank"
             rel="noopener noreferrer"
             style="display: inline-block; padding: 15px 32px; background: #005633; color: #fff; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px; margin: 0.5rem 0.5rem 0.5rem 0;">
            View Order Status & Downloads
          </a>
        `
            : ''
        }
      </div>
    `;

    this.resultsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  displayOrderDetails(order) {
    // Display order details without downloads or status link
    this.resultsElement.style.display = 'block';
    this.resultsElement.classList.add('show');

    let orderDetailsHtml = '';
    if (order) {
      orderDetailsHtml = `
        <div style="margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(var(--color-foreground), 0.1);">
          <p style="margin: 0.5rem 0;"><strong>Order:</strong> ${this.escapeHtml(order.name || '')}</p>
          <p style="margin: 0.5rem 0;"><strong>Date:</strong> ${
            order.created_at ? new Date(order.created_at).toLocaleDateString() : ''
          }</p>
          <p style="margin: 0.5rem 0;"><strong>Total:</strong> ${order.currency || '$'}${order.total_price || ''}</p>
        </div>
      `;
    }

    this.detailsElement.innerHTML = orderDetailsHtml;
    this.downloadsElement.innerHTML = `
      <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 2rem; border-radius: var(--inputs-radius);">
        <p style="margin: 0 0 15px 0; color: #856404; font-weight: 600; font-size: 1.6rem;">
          ✅ Order Found!
        </p>
        <p style="margin: 0; color: rgb(var(--color-foreground));">
          Your order has been found. Please check your email for download links or contact support if you need assistance.
        </p>
      </div>
    `;

    this.resultsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  displayOrderStatusLink(orderStatusUrl) {
    // Legacy method - no longer redirects, just returns the URL
    // This method is kept for compatibility but should not be used
    console.warn('displayOrderStatusLink called but redirects are disabled');
    return orderStatusUrl;
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
document.addEventListener('DOMContentLoaded', function () {
  const findOrderForm = document.getElementById('FindOrderForm');

  if (findOrderForm) {
    new FindOrder(findOrderForm);
  }
});
