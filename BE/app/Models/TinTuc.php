<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class TinTuc extends Model
{
    use HasFactory, SoftDeletes;

        protected $table = 'tin_tuc';

        protected $fillable = [
            'tieu_de',
            'noi_dung',
            'hinh_anh',
        ];
}
