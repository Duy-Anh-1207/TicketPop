<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DoAn extends Model
{
    use HasFactory;

    use SoftDeletes;
    
    protected $table='don_do_an';
    protected $fillable =[
        'ten_do_an',
        'image',
        'mo_ta',
        'gia_nhap',
        'gia_ban',
        'so_luong_ton',
    ];
    public function donDoAn(){
        return $this->hasMany(DonDoAn::class, 'do_an_id');
    }

}
