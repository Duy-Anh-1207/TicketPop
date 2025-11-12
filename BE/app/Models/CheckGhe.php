<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckGhe extends Model
{
    protected $table = 'check_ghe';
     protected $casts = [
        'trang_thai' => 'integer',
    ];
    protected $fillable = ['lich_chieu_id', 'nguoi_dung_id', 'ghe_id', 'trang_thai', 'created_at', 'updated_at'];
     public function lichChieu()
    {
        return $this->belongsTo(LichChieu::class, 'lich_chieu_id');
    }

    // 🔗 Quan hệ ngược với Ghe
    public function ghe()
    {
        return $this->belongsTo(Ghe::class, 'ghe_id');
    }
}
