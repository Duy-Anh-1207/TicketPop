<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ghe extends Model
{
    use SoftDeletes;
    protected $table = 'ghe';
<<<<<<< HEAD
    protected $fillable = [
        'phong_id',
        'loai_ghe_id',
        'so_ghe',
        'hang',
        'cot',
        'trang_thai',
    ];
=======
    protected $fillable = ['phong_id', 'loai_ghe_id', 'so_ghe', 'hang', 'cot', 'trang_thai'];
    protected $casts = ['trang_thai' => 'boolean'];

    public function phong()
    {
        return $this->belongsTo(Room::class, 'phong_id');
    }

    public function loaiGhe()
    {
        return $this->belongsTo(LoaiGhe::class, 'loai_ghe_id');
    }
>>>>>>> f7b19ac88c625114bd428f23f2f420e37b19273b
}
