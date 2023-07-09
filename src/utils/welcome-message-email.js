/** @format */

const emailTemplate = (name, email, password) => {
  return `
	<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Georgia', serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e6e6e6; background-color: #f9f9f9;">
    <h1 style="color: #333333; font-family: 'Arial', sans-serif;">Selamat datang di Sans Co Cafe</h1>
    <p style="margin-bottom: 20px; line-height: 1.5;">Kepada ${name},</p>
    <p style="margin-bottom: 20px; line-height: 1.5;">Selamat datang di Sans Co Cafe! Kami sangat senang memiliki Anda sebagai bagian dari komunitas kami. Kami harap email ini menemui Anda dalam keadaan baik.</p>
    <p style="margin-bottom: 20px; line-height: 1.5;">Kami ingin memberikan informasi yang diperlukan agar Anda dapat memulai dengan akun Anda. Di bawah ini, Anda akan menemukan rincian login Anda:</p>
    <p style="margin-bottom: 20px; line-height: 1.5;"><span style="font-weight: bold;">Alamat Email:</span> ${email}</p>
    <p style="margin-bottom: 20px; line-height: 1.5;"><span style="font-weight: bold;">Kata Sandi:</span> ${password}</p>
    <p style="margin-bottom: 20px; line-height: 1.5;">Untuk mengakses akun Anda, ikuti langkah-langkah berikut:</p>
    <ol style="margin-bottom: 20px; line-height: 1.5;">
      <li>Kunjungi website kami <a href="https://admin-sansco.vercel.app/"><b>di sini</b></a>.</li>
      <li>Klik tombol "Masuk" atau "Login" yang terletak di pojok kanan atas halaman.</li>
      <li>Masukkan username/alamat email dan kata sandi yang diberikan pada kolom yang sesuai.</li>
      <li>Setelah berhasil login, Anda akan memiliki akses ke dashboard akun Anda, di mana Anda dapat menjelajahi platform kami dan fitur-fiturnya.</li>
    </ol>
    <p style="margin-bottom: 20px; line-height: 1.5;">Kami merekomendasikan agar Anda mengubah kata sandi pada saat login pertama kali untuk tujuan keamanan. Untuk melakukannya, silakan navigasikan ke bagian pengaturan akun di dalam dashboard Anda.</p>
    <p style="margin-bottom: 20px; line-height: 1.5;">Sekali lagi, selamat datang di Sans Co Cafe! Kami berharap dapat memberikan layanan terbaik kepada Anda dan memberikan pengalaman yang luar biasa. Terima kasih telah memilih kami!</p>
    <p style="line-height: 1.5;">Salam hangat.</p>
  </div>
</body>
</html>`;
};

module.exports = emailTemplate;
