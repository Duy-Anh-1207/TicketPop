<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Yêu cầu đặt lại mật khẩu</title>
</head>
<body>
    <p>Xin chào {{ $user->ten }},</p>
    <p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã sau để đặt lại mật khẩu:</p>
    <h2 style="letter-spacing:4px;">{{ $code }}</h2>
    <p>Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email này.</p>
    <p>Mã sẽ hết hạn sau 60 phút.</p>
    <p>Trân trọng,<br/>TicketPop</p>
</body>
</html>