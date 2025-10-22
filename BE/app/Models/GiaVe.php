<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GiaVe extends Model
{
    use HasFactory;

    protected $table = 'gia_ve';

    /**
     * Các cột được phép gán (mass assignable)
     */
    protected $fillable = [
        'lich_chieu_id',
        'loai_ghe_id',
        'gia_ve',
    ];

    /**
     * Quan hệ với LichChieu
     */
    public function lichChieu()
    {
        return $this->belongsTo(LichChieu::class, 'lich_chieu_id');
    }

    /**
     * Quan hệ với LoaiGhe
     */
    public function loaiGhe()
    {
        return $this->belongsTo(LoaiGhe::class, 'loai_ghe_id');
    }
}
