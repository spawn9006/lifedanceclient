
/**
 * contact.js — submit cu reCAPTCHA v3 + UX mai bun (disable button & mesaj inline)
 */
const FORM_ID = 'contact';
const RECAPTCHA_SITE_KEY = '6LdOVMErAAAAAP7IlGaEZb5d9d1HsstsXLnX7zHz';
const RECAPTCHA_ACTION = 'contact';

function setMsg(el, text, type = 'info') {
    if (!el) return;
    el.textContent = text || '';
    el.classList.remove('is-success', 'is-error', 'is-info');
    el.classList.add(type === 'success' ? 'is-success'
        : type === 'error' ? 'is-error'
            : 'is-info');
}

window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById(FORM_ID);
    if (!form) return;

    const msg = document.getElementById('form-message');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        if (typeof grecaptcha === 'undefined') {
            setMsg(msg, 'reCAPTCHA nu este încărcat. Reîncarcă pagina și încearcă din nou.', 'error');
            return;
        }

        // locking UI
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.dataset._label = submitBtn.textContent;
            submitBtn.textContent = 'Se trimite...';
        }
        setMsg(msg, 'Se trimite mesajul...', 'info');

        grecaptcha.ready(async function() {
            try {
                const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: RECAPTCHA_ACTION });

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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const out = await res.json().catch(() => ({}));

                if (res.ok && out.ok) {
                    setMsg(msg, 'Mulțumim! Mesajul a fost trimis cu succes.', 'success');
                    form.reset();
                } else {
                    const err = out?.error || 'Nu s-a putut trimite mesajul. Încearcă din nou.';
                    setMsg(msg, `Eroare: ${err}`, 'error');
                }
            } catch (err) {
                setMsg(msg, 'Eroare de rețea sau reCAPTCHA. Încearcă din nou.', 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = submitBtn.dataset._label || 'Trimite';
                    delete submitBtn.dataset._label;
                }
            }
        });
    });
});