<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhienBan extends Model
{
    use HasFactory;

    // Nếu tên bảng không phải là dạng số nhiều (vd: phien_bans) thì cần chỉ rõ
    protected $table = 'phien_ban';

    // Các cột được phép ghi dữ liệu (mass assignment)
    protected $fillable = [
        'the_loai',
    ];

    // Nếu có quan hệ với bảng khác (ví dụ bảng phim)
    public function phim()
    {
        return $this->hasMany(Phim::class, 'phien_ban_id');
    }
}
