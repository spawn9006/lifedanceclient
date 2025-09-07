<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/phpmailer/Exception.php';
require __DIR__ . '/phpmailer/PHPMailer.php';
require __DIR__ . '/phpmailer/SMTP.php';

header('Content-Type: application/json; charset=utf-8');

$env = parse_ini_file('/home/oukygmkd/.secrets/lifeisdance.env', false, INI_SCANNER_TYPED);
if ($env === false) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'error'=>'Nu pot citi fișierul de configurare.']); exit;
}

$allowed = array_map('trim', explode(',', $env['ALLOWED_ORIGINS'] ?? ''));
$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowed, true)) {
  header('Access-Control-Allow-Origin: '.$origin);
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// rate limit 30s/IP
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$bucket = sys_get_temp_dir() . '/lid_rate_' . md5($ip);
if (file_exists($bucket) && (time() - filemtime($bucket) < 30)) { http_response_code(429); echo json_encode(['ok'=>false,'error'=>'Prea multe cereri']); exit; }
touch($bucket);

// body
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data) $data = $_POST;

// reCAPTCHA v3
$token  = trim($data['recaptcha_token'] ?? '');
$action = trim($data['recaptcha_action'] ?? '');
if ($token === '') { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Lipsește tokenul reCAPTCHA']); exit; }

$ch = curl_init('https://www.google.com/recaptcha/api/siteverify');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => http_build_query([
    'secret'   => $env['RECAPTCHA_SECRET'],
    'response' => $token,
    'remoteip' => $ip
  ]),
]);
$resp = curl_exec($ch); $err = curl_error($ch); curl_close($ch);
if ($resp === false) { http_response_code(502); echo json_encode(['ok'=>false,'error'=>'Eroare reCAPTCHA: '.$err]); exit; }
$rc = json_decode($resp, true);
if (!($rc['success'] ?? false)) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'reCAPTCHA a eșuat']); exit; }
if (($env['EXPECTED_ACTION'] ?? '') && ($rc['action'] ?? '') !== $env['EXPECTED_ACTION']) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Acțiune reCAPTCHA invalidă']); exit; }
if (isset($rc['score']) && floatval($rc['score']) < floatval($env['MIN_SCORE'] ?? 0.5)) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Scor reCAPTCHA prea mic']); exit; }

// fields
$nume  = trim($data['nume'] ?? '');
$pref  = trim($data['contact-preference'] ?? $data['preference'] ?? '');
$tel   = trim($data['telefon'] ?? '');
$email = trim($data['email'] ?? '');
$mesaj = trim($data['mesaj'] ?? '');
if ($nume === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Nume sau email invalid']); exit; }

// mail
$subject = 'Lead nou de pe site';
$body = "Nume: $nume\nEmail: $email\nTelefon: $tel\nPreferinta: $pref\n\nMesaj:\n$mesaj\n\nIP: $ip\n";

try {
  $m = new PHPMailer(true);
  $m->isSMTP();
  $m->Host       = $env['SMTP_HOST'];
  $m->SMTPAuth   = true;
  $m->Username   = $env['SMTP_USERNAME'];
  $m->Password   = $env['SMTP_PASSWORD'];
  $m->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
  $m->Port       = (int)($env['SMTP_PORT'] ?? 587);

  $m->setFrom($env['FROM_EMAIL'], 'Form Website');
  $m->addAddress($env['TO_EMAIL']);
  $m->addReplyTo($email, $nume);

  $m->Subject = $subject;
  $m->Body    = $body;

  $m->send();
  echo json_encode(['ok'=>true]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'error'=>$m->ErrorInfo ?: 'Eroare necunoscută']);
}