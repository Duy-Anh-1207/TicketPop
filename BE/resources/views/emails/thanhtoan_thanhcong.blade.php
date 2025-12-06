@php
    $tt       = $thanhToan;
    $datVe    = $tt->datVe ?? null;
    $ghe      = $datVe && $datVe->chiTiet ? $datVe->chiTiet->pluck('ghe_id')->implode(', ') : '';
    $tongTien = number_format($tt->tong_tien_goc ?? 0, 0, ',', '.');
@endphp

@component('mail::message')

# 🎉 THANH TOÁN THÀNH CÔNG!

Xin chào **{{ $tt->ho_ten }}**,  
Cảm ơn bạn đã tin tưởng và sử dụng **TicketPop**. Đơn vé của bạn đã được thanh toán **THÀNH CÔNG**.

---

## 🎬 Thông tin đơn vé  
**Mã đơn vé:** #{{ $tt->dat_ve_id }}

@isset($datVe)
- **Mã vé:** {{ $datVe->id }}
@if($ghe)
- **Ghế:** {{ $ghe }}
@endif
@endisset

- **Tổng tiền:** **{{ $tongTien }} VND**  
- **Mã giao dịch:** {{ $tt->ma_giao_dich }}

---

@if ($tt->qr_code)
## 📱 Mã QR Check-in

Vui lòng xuất trình mã QR bên dưới khi vào rạp:

> Nếu không thấy ảnh, bạn hãy bật chế độ hiển thị hình ảnh trong email.
@endif

---

## ❤️ Cảm ơn bạn!
Chúc bạn có một buổi xem phim thật vui vẻ cùng **TicketPop**!  
Nếu cần hỗ trợ, chỉ cần trả lời trực tiếp email này.

@endcomponent
