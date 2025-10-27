<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GiaVe extends Model
{
    use HasFactory;
    // use SoftDeletes; // nếu bạn muốn xóa mềm

    protected $table = 'gia_ve';
    

    protected $fillable = [
        'lich_chieu_id',
        'loai_ghe_id',
        'gia_ve',
    ];

    /**
     * 🔹 Mỗi giá vé thuộc về 1 lịch chiếu
     */
    public function lichChieu()
    {
        return $this->belongsTo(LichChieu::class, 'lich_chieu_id');
    }

    /**
     * 🔹 Mỗi giá vé thuộc về 1 loại ghế
     */
    public function loaiGhe()
    {
        return $this->belongsTo(LoaiGhe::class, 'loai_ghe_id');
    }
   
}
