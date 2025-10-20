<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    protected $table = 'menu';

    protected $fillable = [
        'ma_chuc_nang','ma_cha','ten_chuc_nang','state','stt','trang_thai',
        
    ];

    // Quan hệ cha–con dựa trên mã
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'ma_cha', 'ma_chuc_nang');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Menu::class, 'ma_cha', 'ma_chuc_nang');
    }

    // scope tiện lọc menu đang hoạt động
    public function scopeActive($q)
    {
        return $q->where('trang_thai', 1);
    }
}
