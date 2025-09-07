
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
        : type === 'error'   ? 'is-error'
            : 'is-info');
}

window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById(FORM_ID);
    if (!form) return;

    const msg = document.getElementById('form-message');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (typeof grecaptcha === 'undefined') {
            setMsg(msg, 'reCAPTCHA nu este încărcat. Reîncarcă pagina și încearcă din nou.', 'error');
            return;
        }

        // lock UI
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.dataset._label = submitBtn.textContent;
            submitBtn.textContent = 'Se trimite...';
        }
        setMsg(msg, 'Se trimite mesajul...', 'info');

        grecaptcha.ready(async () => {
            // 1) Obține tokenul în siguranță
            let token = '';
            try {
                token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: RECAPTCHA_ACTION });
            } catch (err) {
                console.error('reCAPTCHA error:', err);
                setMsg(msg, 'reCAPTCHA nu a putut fi inițializat. Reîncarcă pagina și încearcă din nou.', 'error');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = submitBtn.dataset._label || 'Trimite';
                    delete submitBtn.dataset._label;
                }
                return;
            }

            // 2) Construiește payload-ul ca FormData (evită preflight/WAF)
            const fd = new FormData();
            fd.append('nume', document.getElementById('nume')?.value || '');
            fd.append('contact-preference', document.querySelector('input[name="contact-preference"]:checked')?.value || '');
            fd.append('telefon', document.getElementById('telefon')?.value || '');
            fd.append('email', document.getElementById('email')?.value || '');
            fd.append('mesaj', document.getElementById('mesaj')?.value || '');
            fd.append('recaptcha_token', token);
            fd.append('recaptcha_action', RECAPTCHA_ACTION);

            // 3) Trimite request-ul (URL absolut pentru a evita probleme www/non-www)
            let res;
            try {
                res = await fetch(`${window.location.origin}/api/contact.php`, {
                    method: 'POST',
                    body: fd
                });
            } catch (err) {
                console.error('fetch network error:', err);
                setMsg(msg, 'Conexiunea a eșuat. Verifică internetul și încearcă din nou.', 'error');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = submitBtn.dataset._label || 'Trimite';
                    delete submitBtn.dataset._label;
                }
                return;
            }

            // 4) Citește răspunsul safe (mai întâi text, apoi încearcă JSON)
            let text = '';
            try { text = await res.text(); } catch { text = ''; }

            let out = {};
            try { out = text ? JSON.parse(text) : {}; }
            catch {
                out = { ok: false, error: `Răspuns neașteptat (HTTP ${res.status}): ${text.slice(0, 200)}` };
            }

            // 5) Afișează rezultatul
            if (res.ok && out && out.ok) {
                setMsg(msg, 'Mulțumim! Mesajul a fost trimis cu succes.', 'success');
                form.reset();
            } else {
                const errMsg =
                    (out && out.error) ? String(out.error) :
                        (res.ok ? 'Răspuns neașteptat de la server.' : `Eroare server (HTTP ${res.status}).`);
                setMsg(msg, `Eroare: ${errMsg}`, 'error');
                console.debug('Response debug:', {
                    status: res.status,
                    headers: Object.fromEntries(res.headers.entries()),
                    bodyPreview: text.slice(0, 300)
                });
            }

            // 6) Deblochează UI
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = submitBtn.dataset._label || 'Trimite';
                delete submitBtn.dataset._label;
            }
        });
    });
});