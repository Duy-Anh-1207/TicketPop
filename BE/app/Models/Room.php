<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Room extends Model
{
    use SoftDeletes;
    protected $table = 'phong_chieu';
    protected $fillable = [
        'ten_phong',
        'loai_so_do',
        'hang_thuong',
        'hang_vip',
        'trang_thai',
    ];

    public function ghes()
    {
        return $this->hasMany(Ghe::class, 'phong_id');
    }
     public function lichChieu()
    {
        return $this->hasMany(LichChieu::class, 'phong_id');
    }
}
