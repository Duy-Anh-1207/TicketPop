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
     * Quan hệ 1 vai trò có nhiều người dùng.
     */
    public function nguoiDungs(): HasMany
    {
        return $this->hasMany(NguoiDung::class, 'vai_tro_id');
    }
}
