<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable; // Sử dụng lớp Authenticatable của Laravel
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NguoiDung extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'nguoi_dung';

    protected $fillable = [
        'ten',
        'email',
        'so_dien_thoai',
        'password',
        'anh_dai_dien',
        'trang_thai',
        'vai_tro_id',
    ];

    protected $hidden = [
        'password',
    ];

    
    protected $casts = [
        'password' => 'hashed', // Tự động băm mật khẩu khi gán giá trị
        'trang_thai' => 'boolean', // Chuyển đổi tinyint thành true/false
    ];

    public $timestamps = true;

    
    public function vaiTro(): BelongsTo
    {
        return $this->belongsTo(VaiTro::class, 'vai_tro_id');
    }

}
