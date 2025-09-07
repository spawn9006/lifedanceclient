\
SMTP + PHPMailer + reCAPTCHA v3 — lifeisdance.ro

FILES
-----
/api/contact.php        -> handler PHP (SMTP with PHPMailer, reCAPTCHA v3)
/api/.htaccess          -> disables listing & restricts methods
/api/phpmailer/         -> PLACE HERE the PHPMailer src files (PHPMailer.php, SMTP.php, Exception.php)
/contact.js             -> client-side helper to collect form data and attach reCAPTCHA token

SETUP
-----
1) Create or use the mailbox: bot@lifeisdance.ro (in cPanel -> Email Accounts).
2) Download PHPMailer from the official repository and upload the *three files* from "src/":
   - PHPMailer.php
   - SMTP.php
   - Exception.php
   Place them in: public_html/api/phpmailer/
3) Edit public_html/api/contact.php and set:
   - $SMTP_PASSWORD to your mailbox password
   - (optional) adjust $TO_EMAIL and $FROM_EMAIL
   - put your reCAPTCHA v3 secret in $RECAPTCHA_SECRET
   - add 'https://www.lifeisdance.ro' to the allowed origins if you serve from www
4) Generate reCAPTCHA v3 keys for your domain.
   - Put SITE KEY in contact.js
   - Put SECRET in contact.php
5) Upload 'contact.js' next to your page and include:
   <script src="https://www.google.com/recaptcha/api.js?render=RECAPTCHA_SITE_KEY"></script>
   <script src="/contact.js" defer></script>
6) Your existing form with id="contact" will work as-is.

SECURITY
--------
- Simple 30s/IP rate-limit is included; consider hCaptcha/reCAPTCHA tuning if needed.
- Keep contact.php outside version control if you store passwords.
