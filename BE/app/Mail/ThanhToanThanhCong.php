<?php

namespace App\Mail;

use App\Models\ThanhToan;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ThanhToanThanhCong extends Mailable
{
    use Queueable, SerializesModels;

    public $thanhToan;

    public function __construct(ThanhToan $thanhToan)
    {
        // load luôn datVe & chiTiet nếu có quan hệ
        $this->thanhToan = $thanhToan->loadMissing('datVe.chiTiet');
    }

    public function build()
    {
        $subject = 'Xác nhận thanh toán vé #' . $this->thanhToan->dat_ve_id;

        $mail = $this->subject($subject)
            ->markdown('emails.thanhtoan_thanhcong');

        // Nếu có file QR thì đính kèm
        if ($this->thanhToan->qr_code) {
            $path = storage_path('app/public/' . $this->thanhToan->qr_code);
            if (file_exists($path)) {
                $mail->attach($path, [
                    'as'   => 've_qr.png',
                    'mime' => 'image/png',
                ]);
            }
        }

        return $mail;
    }
}
