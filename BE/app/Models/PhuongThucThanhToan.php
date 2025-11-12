<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int         $id
 * @property string|null $ten
 * @property string|null $nha_cung_cap
 * @property string|null $mo_ta
 */
class PhuongThucThanhToan extends Model
{
    use HasFactory;

    protected $table = 'phuong_thuc_thanh_toan';

    protected $fillable = [
        'ten',
        'nha_cung_cap',
        'mo_ta',
    ];

    protected $casts = [
        'id'            => 'integer',
        'ten'           => 'string',
        'nha_cung_cap'  => 'string',
        'mo_ta'         => 'string',
        'created_at'    => 'datetime',
        'updated_at'    => 'datetime',
    ];

    // Quan hệ: một phương thức thanh toán có nhiều bản ghi thanh_toan
    public function thanhToans()
    {
        return $this->hasMany(ThanhToan::class, 'phuong_thuc_thanh_toan_id');
    }

    // Scope tiện dụng: lọc theo nhà cung cấp
    public function scopeNhaCungCap($query, string $ncc)
    {
        return $query->where('nha_cung_cap', $ncc);
    }

    // Lấy id phương thức MoMo nếu cần
    public static function momoId(): ?int
    {
        return static::where('nha_cung_cap', 'MOMO')->value('id');
    }
}
