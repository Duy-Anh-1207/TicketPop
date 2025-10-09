<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VaiTro extends Model
{
    use HasFactory;

    protected $table = 'vai_tro'; // Tên bảng trong database

    protected $fillable = [
        
        'ten_vai_tro', 
        'mo_ta',        
    ];

    public $timestamps = true; // vì bảng có created_at và updated_at

    // Quan hệ 1 vai trò có nhiều người dùng
    public function nguoiDungs()
    {
        return $this->hasMany(User::class, 'vai_tro_id');
    }
}
