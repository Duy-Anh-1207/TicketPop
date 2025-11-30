@php
    $tt    = $thanhToan;
    $datVe = $tt->datVe ?? null;
    $ghe   = $datVe && $datVe->chiTiet ? $datVe->chiTiet->pluck('ghe_id')->implode(', ') : '';
    $tongTien = number_format($tt->tong_tien_goc ?? 0, 0, ',', '.');
@endphp

@component('mail::message')
# Thanh toán thành công

Chào **{{ $tt->ho_ten }}**,

Thanh toán của bạn cho đơn vé **#{{ $tt->dat_ve_id }}** đã được xử lý **THÀNH CÔNG**.

@isset($datVe)
**Thông tin vé:**

- Mã vé: **{{ $datVe->id }}**
@if($ghe)
- Ghế: **{{ $ghe }}**
@endif
@endisset

- Tổng tiền: **{{ $tongTien }} VND**
- Mã giao dịch: **{{ $tt->ma_giao_dich }}**

@if($tt->qr_code)
> Mã QR vé đã được đính kèm trong email này.  
> Vui lòng xuất trình QR khi vào rạp.
@endif

Cảm ơn bạn đã sử dụng TicketPop!  

@endcomponent
