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
}
