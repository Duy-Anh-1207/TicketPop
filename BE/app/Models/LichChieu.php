<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class LichChieu extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'lich_chieu';

    protected $fillable = [
        'phim_id',
        'phong_id',
        'phien_ban_id',
        'gio_chieu',
        'gio_ket_thuc'
    ];

    // Quan hệ với các model khác
    public function phim()
    {
        return $this->belongsTo(Phim::class, 'phim_id');
    }

    public function phong()
    {
        return $this->belongsTo(Room::class, 'phong_id');
    }

    public function phienBan()
    {
        return $this->belongsTo(PhienBan::class, 'phien_ban_id'); 
    }
    
}
