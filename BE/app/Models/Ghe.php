<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ghe extends Model
{
    use SoftDeletes;
    protected $table = 'ghe';
    protected $fillable = [
        'phong_id',
        'loai_ghe_id',
        'so_ghe',
        'hang',
        'cot',
        'trang_thai',
    ];

    public function phongChieu()
    {
        return $this->belongsTo(Room::class, 'phong_id', 'id');
    }

    public function loaiGhe()
    {
        return $this->belongsTo(LoaiGhe::class, 'loai_ghe_id');
    }
}
