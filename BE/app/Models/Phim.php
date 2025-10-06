<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Phim extends Model
{
    use SoftDeletes;

    protected $table = 'phim';

    protected $fillable = [
        'ten_phim', 'mo_ta', 'thoi_luong', 'trailer', 'ngon_ngu', 'quoc_gia',
        'anh_poster', 'ngay_cong_chieu', 'ngay_ket_thuc', 'do_tuoi_gioi_han',
        'loai_suat_chieu', 'phien_ban_id', 'the_loai_id'
    ];

    
}