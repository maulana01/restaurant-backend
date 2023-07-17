/** @format */

const emailTemplate = (name, email, token) => {
  return `
	<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e6e6e6; background-color: #f9f9f9;">
    <h1 style="color: #333333;">Lupa Password?</h1>
    <p>Kepada ${name},</p>
    <p>Kami menerima permintaan untuk mereset password akun Sans Co Cafe Admin Anda. Jika Anda tidak membuat permintaan ini, silakan abaikan email ini.</p>
    <p>Untuk mereset password Anda, klik tombol di bawah ini:</p>
    <p><a href="http://localhost:3000/reset-password/${token}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: #ffffff; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
    <p>Terima kasih.</p>
  </div>
</body>
</html>`;
};

module.exports = emailTemplate;
