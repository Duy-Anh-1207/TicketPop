<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    // Nếu bảng không phải là "users", cần chỉ định rõ
    protected $table = 'nguoi_dung';

    protected $fillable = [
        'ten',
        'email',
        'so_dien_thoai',
        'password',
        'anh_dai_dien',
        'trang_thai',
        'vai_tro_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'password' => 'hashed',
    ];
    public $timestamps = true; // hoặc không cần khai báo vì mặc định là true
    public function vaiTro()
{
    return $this->belongsTo(VaiTro::class, 'vai_tro_id');
}
}
