import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_bxdpt2d";
const PUBLIC_KEY = "ju_u58YM3bsxk7p6p";
const WELCOME_TEMPLATE_ID = "template_wf5eaiz";

// Generic helper: other pages can reuse it (for example for reminders later)
export function sendEmail(templateId, params) {
  return emailjs.send(SERVICE_ID, templateId, params, { publicKey: PUBLIC_KEY });
}

export function sendWelcomeEmail(name, email) {
  return sendEmail(WELCOME_TEMPLATE_ID, {
    to_name: name,
    to_email: email,
    app_url: window.location.origin,
  });
}