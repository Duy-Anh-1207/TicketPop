<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class DonDoAn extends Model
{
    use HasFactory;

    protected $table = 'don_do_an';

    protected $fillable = [
        'dat_ve_id',
        'do_an_id',
        'gia_ban',
        'so_luong',
    ];

    // Quan hệ đến Đặt vé
    public function datVe()
    {
        return $this->belongsTo(DatVe::class, 'dat_ve_id');
    }

    // Quan hệ đến Đồ ăn
    public function doAn()
    {
        return $this->belongsTo(DoAn::class, 'do_an_id');
    }
}
