/**
 * Cooking with Kahnke - Newsletter Brevo Integration
 * Handles newsletter signup via Brevo API
 */

class KahnkeNewsletter {
  constructor(formElement) {
    this.form = formElement;
    this.submitButton = formElement.querySelector('.kahnke-subscribe-button');
    this.successMessage = formElement.querySelector('.kahnke-form-success');
    this.errorMessage = formElement.querySelector('.kahnke-form-error');
    this.apiKey = formElement.dataset.brevoApiKey;
    this.listId = formElement.dataset.brevoListId;
    
    this.init();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(event) {
    event.preventDefault();

    // Get form data
    const firstName = this.form.querySelector('input[name="first_name"]').value.trim();
    const email = this.form.querySelector('input[name="email"]').value.trim();

    // Validate
    if (!firstName || !email) {
      this.showError('Please fill in all fields.');
      return;
    }

    if (!this.validateEmail(email)) {
      this.showError('Please enter a valid email address.');
      return;
    }

    // Check if API credentials are configured
    if (!this.apiKey || this.apiKey === '') {
      this.showError('Newsletter is not configured. Please add your Brevo API key in the theme settings.');
      return;
    }

    // Disable button during submission
    this.setLoading(true);
    this.hideMessages();

    try {
      await this.subscribeToBrevo(email, firstName);
      this.showSuccess('Thanks for subscribing! Check your email to confirm.');
      this.form.reset();
    } catch (error) {
      console.error('Newsletter signup error:', error);
      this.showError('Something went wrong. Please try again later.');
    } finally {
      this.setLoading(false);
    }
  }

  async subscribeToBrevo(email, firstName) {
    // Brevo API endpoint
    const endpoint = 'https://api.brevo.com/v3/contacts';

    // Prepare contact data
    const contactData = {
      email: email,
      attributes: {
        FIRSTNAME: firstName
      },
      updateEnabled: true
    };

    // Add to list if list ID is provided
    if (this.listId && this.listId !== '') {
      contactData.listIds = [parseInt(this.listId)];
    }

    // Make API request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': this.apiKey
      },
      body: JSON.stringify(contactData)
    });

    // Handle response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // If contact already exists, that's actually success
      if (response.status === 400 && errorData.code === 'duplicate_parameter') {
        return; // Contact already exists, treat as success
      }
      
      throw new Error(`Brevo API error: ${response.status}`);
    }

    return await response.json();
  }

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  setLoading(isLoading) {
    this.submitButton.disabled = isLoading;
    this.submitButton.textContent = isLoading ? 'Subscribing...' : this.submitButton.dataset.originalText || 'Subscribe';
    
    if (!this.submitButton.dataset.originalText) {
      this.submitButton.dataset.originalText = this.submitButton.textContent;
    }
  }

  hideMessages() {
    if (this.successMessage) {
      this.successMessage.classList.remove('show');
      this.successMessage.style.display = 'none';
    }
    if (this.errorMessage) {
      this.errorMessage.classList.remove('show');
      this.errorMessage.style.display = 'none';
    }
  }

  showSuccess(message) {
    if (this.successMessage) {
      this.successMessage.textContent = message;
      this.successMessage.style.display = 'block';
      this.successMessage.classList.add('show');
      
      // Scroll to message
      this.successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  showError(message) {
    if (this.errorMessage) {
      this.errorMessage.textContent = message;
      this.errorMessage.style.display = 'block';
      this.errorMessage.classList.add('show');
      
      // Scroll to message
      this.errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const newsletterForm = document.querySelector('.kahnke-newsletter-form');
  
  if (newsletterForm) {
    new KahnkeNewsletter(newsletterForm);
  }
});

