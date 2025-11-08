<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DatVeChiTiet extends Model
{
    protected $table = 'dat_ve_chi_tiet';
    protected $fillable = [
        'dat_ve_id',
        'ghe_id',
        'gia_ve',
    ];
    public function datVe(){
        return $this->belongsTo(DatVe::class, 'dat_ve_id');
    }
    public function ghe(){
        return $this->belongsTo(Ghe::class, 'ghe_id');
    }
}
