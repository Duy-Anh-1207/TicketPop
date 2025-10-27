<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

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
    ];

    public function vaiTro()
    {
        return $this->belongsTo(VaiTro::class, 'vai_tro_id');
    }

    public function getTenVaiTroAttribute()
    {
        return $this->vaiTro->ten_vai_tro ?? null;
    }
}
