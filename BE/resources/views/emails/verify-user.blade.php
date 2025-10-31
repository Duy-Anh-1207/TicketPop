<!DOCTYPE html>
<html>
<body>
    <p>Xin chào {{ $user->ten }},</p>
    <p>Cảm ơn bạn đã đăng ký tài khoản.</p>
    <p>Mã xác thực của bạn là: <strong>{{ $code }}</strong></p>
    <p>Bạn cũng có thể bấm vào liên kết sau để xác thực nhanh:</p>
    <p><a href="{{ $verifyUrl }}" target="_blank">XÁC THỰC EMAIL</a></p>
    <p>Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.</p>
</body>
</html>
