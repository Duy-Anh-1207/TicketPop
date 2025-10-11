<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VaiTro extends Model
{
    use HasFactory;

    protected $table = 'vai_tro';

    protected $fillable = [
        'ten_vai_tro',
        'mo_ta',
    ];

    public $timestamps = true;

    /**
     * Mối quan hệ nhiều-nhiều với Quyenhan (Permissions).
     */
    public function quyenHans(): BelongsToMany
    {
        return $this->belongsToMany(QuyenHan::class, 'quyen_truy_cap', 'vai_tro_id', 'quyen_han_id');
    }

    /**
     * Quan hệ 1 vai trò có nhiều người dùng.
     */
    public function nguoiDungs(): HasMany
    {
        return $this->hasMany(NguoiDung::class, 'vai_tro_id');
    }
}
