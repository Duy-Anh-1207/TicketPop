<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DanhGia extends Model
{
    protected $table = 'danh_gia';
    protected $fillable = [
        'nguoi_dung_id',
        'phim_id',
        'so_sao',
        'noi_dung',
        'trang_thai'
    ];
    public function phim(){
        return $this->belongsTo(Phim::class,'phim_id');
    }
    public function nguoiDung(){
        return $this->belongsTo(NguoiDung::class,'nguoi_dung_id');
    }
}
