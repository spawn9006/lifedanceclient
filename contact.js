
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

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.dataset._label = submitBtn.textContent;
            submitBtn.textContent = 'Se trimite...';
        }
        setMsg(msg, 'Se trimite mesajul...', 'info');

        grecaptcha.ready(async function() {
            try {
                const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: RECAPTCHA_ACTION });

                // Folosim FormData ca să evităm application/json (reduce preflight & false-positives ModSecurity)
                const fd = new FormData();
                fd.append('nume', document.getElementById('nume')?.value || '');
                fd.append('contact-preference', document.querySelector('input[name="contact-preference"]:checked')?.value || '');
                fd.append('telefon', document.getElementById('telefon')?.value || '');
                fd.append('email', document.getElementById('email')?.value || '');
                fd.append('mesaj', document.getElementById('mesaj')?.value || '');
                fd.append('recaptcha_token', token);
                fd.append('recaptcha_action', RECAPTCHA_ACTION);

                const res = await fetch('/api/contact.php', {
                    method: 'POST',
                    // !!! nu setăm manual Content-Type; browserul pune multipart/form-data
                    body: fd,
                    // mode: 'same-origin' // (opțional) dacă vrei să fii explicit
                });

                // Uneori ModSecurity răspunde cu HTML (403). Încercăm JSON, altfel text.
                const ct = res.headers.get('content-type') || '';
                const isJSON = ct.includes('application/json');
                const out = isJSON ? await res.json().catch(() => ({})) : { ok: false, error: await res.text() };

                if (res.ok && out.ok) {
                    setMsg(msg, 'Mulțumim! Mesajul a fost trimis cu succes.', 'success');
                    form.reset();
                } else {
                    const err = (out && out.error) ? String(out.error) : 'Nu s-a putut trimite mesajul.';
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