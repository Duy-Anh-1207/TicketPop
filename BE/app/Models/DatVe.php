<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DatVe extends Model
{
    protected $table = 'dat_ve';
    protected $fillable = [
        'nguoi_dung_id',
        'lich_chieu_id',
        'tong_tien',
    ];
    public function nguoiDung()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_dung_id');
    }
    public function lichChieu()
    {
        return $this->belongsTo(LichChieu::class, 'lich_chieu_id');
    }
    public function chiTiet()
    {
        return $this->hasMany(DatVeChiTiet::class, 'dat_ve_id');
    }

    public function donDoAn()
    {
        return $this->hasMany(DonDoAn::class, 'dat_ve_id');
    }
    public function thanhToan()
    {
        return $this->hasOne(ThanhToan::class, 'dat_ve_id');
    }
    public function maGiamGia(){
        return $this->belongsTo(MaGiamGia::class, 'ma_giam_gia_id');
    }
}
