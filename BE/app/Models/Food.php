<?php
namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Food extends Model
{
    use SoftDeletes;

    protected $table = 'do_an';

    protected $fillable = [
        'ten_do_an',
        'image',
        'mo_ta',
        'gia_nhap',
        'gia_ban',
        'so_luong_ton',
    ];
}


