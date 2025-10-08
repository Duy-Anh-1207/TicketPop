<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VaiTro extends Model
{
    //
    use HasFactory;

    protected $table = 'vai_tro'; // Tên bảng trong database

    protected $fillable = [
        'ten', // Tên vai trò (ví dụ: Quản trị viên, Người dùng, Biên tập viên)
    ];

    public $timestamps = true; // Nếu bảng có cột created_at và updated_at

    // Quan hệ ngược với người dùng
    public function nguoiDungs()
    {
        return $this->hasMany(User::class, 'vai_tro_id');
    }
}
