<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifyEmailUser extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $verifyUrl;
    public $code;

    public function __construct(User $user, string $verifyUrl, string $code)
    {
        $this->user = $user;
        $this->verifyUrl = $verifyUrl;
        $this->code = $code;
    }

    public function build()
    {
        return $this->subject('Xác thực email tài khoản của bạn')
            ->view('emails.verify-user');
    }
}
