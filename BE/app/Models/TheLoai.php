<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
class TheLoai extends Model
{

    use HasFactory, SoftDeletes;
    protected $table = 'the_loai';
    protected $fillable = ['ten_the_loai'];

}
