
/**
 * contact.js — submits the existing #contact form to /api/contact.php with reCAPTCHA v3 token.
 */
const FORM_ID = 'contact';
const RECAPTCHA_SITE_KEY = '6LdOVMErAAAAAP7IlGaEZb5d9d1HsstsXLnX7zHz';
const RECAPTCHA_ACTION = 'contact';

window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById(FORM_ID);
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    if (typeof grecaptcha === 'undefined') {
      alert('reCAPTCHA nu este încărcat.');
      return;
    }

    grecaptcha.ready(async function() {
      try {
        const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, {action: RECAPTCHA_ACTION});
        const payload = {
          nume: document.getElementById('nume')?.value || '',
          'contact-preference': document.querySelector('input[name="contact-preference"]:checked')?.value || '',
          telefon: document.getElementById('telefon')?.value || '',
          email: document.getElementById('email')?.value || '',
          mesaj: document.getElementById('mesaj')?.value || '',
          recaptcha_token: token,
          recaptcha_action: RECAPTCHA_ACTION,
        };

        const res = await fetch('/api/contact.php', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload)
        });

        const out = await res.json().catch(() => ({}));
        if (res.ok && out.ok) {
          alert('Mulțumim! Mesajul a fost trimis.');
          form.reset();
        } else {
          alert('Eroare: ' + (out.error || 'NU s-a putut trimite mesajul'));
        }
      } catch (err) {
        alert('Eroare de rețea sau reCAPTCHA. Încearcă din nou.');
      }
    });
  });
});
