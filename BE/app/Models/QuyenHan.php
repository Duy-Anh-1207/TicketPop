<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class QuyenHan extends Model
{
    use HasFactory;

    /**
     * Tên bảng trong database
     */
    protected $table = 'quyen_han';

    /**
     * Các trường được phép gán giá trị hàng loạt.
     */
    protected $fillable = [
        'quyen',
        'mo_ta',
    ];

    /**
     * Bảng có cột created_at và updated_at.
     */
    public $timestamps = true;

    /**
     * Mối quan hệ nhiều-nhiều với VaiTro (Roles).
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function vaiTros(): BelongsToMany
    {
        return $this->belongsToMany(VaiTro::class, 'quyen_truy_cap', 'quyen_han_id', 'vai_tro_id');
    }
}
