<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaGiamGia extends Model
{
    use HasFactory;

    protected $table = 'ma_giam_gia';

    protected $fillable = [
        'ma',
        'image',
        'giam_toi_da',
        'gia_tri_don_hang_toi_thieu',
        'phan_tram_giam',
        'ngay_bat_dau',
        'ngay_ket_thuc',
        'so_lan_su_dung',
        'so_lan_da_su_dung',
        'trang_thai'
    ];
}
