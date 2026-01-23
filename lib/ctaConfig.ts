type Company = {
  business_type?: string;
  cta_heading?: string | null;
  cta_button_text?: string | null;
  cta_success_message?: string | null;
};

export function getCTAConfig(company: Company) {
  const businessType = company.business_type || 'general';
  
  return {
    heading: company.cta_heading || getDefaultHeading(businessType),
    buttonText: company.cta_button_text || getDefaultButtonText(businessType),
    successMessage: company.cta_success_message || getDefaultSuccessMessage(businessType),
  };
}

function getDefaultHeading(businessType: string): string {
  switch (businessType) {
    case 'construction':
      return 'Start Your Construction Project';
    case 'hvac':
      return 'Request HVAC Service';
    case 'food_services':
      return 'Place Your Order';
    case 'restaurant':
      return 'Order Your Custom Meal';
    case 'salon':
      return 'Book Your Appointment';
    case 'photography':
      return 'Request a Photo Session';
    case 'home_services':
      return 'Request Home Service';
    default:
      return 'Submit Your Project';
  }
}

function getDefaultButtonText(businessType: string): string {
  switch (businessType) {
    case 'construction':
      return '🔨 Submit Project';
    case 'hvac':
      return '❄️ Request Service';
    case 'food_services':
      return '🍰 Place Order';
    case 'restaurant':
      return '🍽️ Place Order';
    case 'salon':
      return '💇 Book Appointment';
    case 'photography':
      return '📸 Request Session';
    case 'home_services':
      return '🏠 Submit Request';
    default:
      return '📸 Submit Project';
  }
}

function getDefaultSuccessMessage(businessType: string): string {
  switch (businessType) {
    case 'construction':
      return 'Your construction project request has been submitted! We\'ll review your details and get back to you with a quote soon.';
    case 'hvac':
      return 'Your service request has been received! Our team will contact you shortly to schedule your appointment.';
    case 'food_services':
      return 'Your order has been received! We\'ll contact you shortly to confirm details and delivery/pickup time.';
    case 'restaurant':
      return 'Your order has been placed! We\'ll reach out soon to confirm your order details.';
    case 'salon':
      return 'Your appointment request has been received! We\'ll contact you soon to confirm your preferred time.';
    case 'photography':
      return 'Your session request has been submitted! We\'ll be in touch to discuss details and scheduling.';
    case 'home_services':
      return 'Your service request has been received! We\'ll contact you shortly with next steps.';
    default:
      return 'Your submission has been received! We\'ll review your request and get back to you soon.';
  }
}