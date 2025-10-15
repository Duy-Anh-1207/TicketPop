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
}
