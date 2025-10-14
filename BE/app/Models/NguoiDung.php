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

    /**
     * Tên bảng trong database
     */
    protected $table = 'nguoi_dung';

    /**
     * Các trường được phép gán giá trị hàng loạt.
     */
    protected $fillable = [
        'ten',
        'email',
        'so_dien_thoai',
        'password',
        'anh_dai_dien',
        'trang_thai',
        'vai_tro_id',
    ];

    /**
     * Các trường nên được ẩn khi chuyển thành mảng hoặc JSON.
     */
    protected $hidden = [
        'password',
    ];

    /**
     * Các trường nên được ép kiểu.
     */
    protected $casts = [
        'password' => 'hashed', // Tự động băm mật khẩu khi gán giá trị
        'trang_thai' => 'boolean', // Chuyển đổi tinyint thành true/false
    ];

    /**
     * Bảng có cột created_at và updated_at.
     */
    public $timestamps = true;

    /**
     * Mối quan hệ "thuộc về" với VaiTro.
     * Mỗi NguoiDung thuộc về một VaiTro.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function vaiTro(): BelongsTo
    {
        return $this->belongsTo(VaiTro::class, 'vai_tro_id');
    }

    // Bạn có thể thêm các mối quan hệ khác ở đây, ví dụ:
    // public function datVes() { ... }
    // public function danhGias() { ... }
}
