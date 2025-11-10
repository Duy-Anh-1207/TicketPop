<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int         $id
 * @property int|null    $dat_ve_id
 * @property int|null    $nguoi_dung_id
 * @property int|null    $phuong_thuc_thanh_toan_id
 * @property string|null $ma_giao_dich
 * @property int|null    $ma_giam_gia_id
 * @property int|null    $tong_tien_goc
 * @property string|null $email
 * @property string|null $ho_ten
 * @property string|null $qr_code
 * @property bool        $da_quet
 * @property bool        $ghe_hong
 */
class ThanhToan extends Model
{
    use HasFactory;

    protected $table = 'thanh_toan';

    protected $fillable = [
        'dat_ve_id',
        'nguoi_dung_id',
        'phuong_thuc_thanh_toan_id',
        'ma_giao_dich',
        'ma_giam_gia_id',
        'tong_tien_goc',
        'email',
        'ho_ten',
        'qr_code',
        'da_quet',
        'ghe_hong',
    ];

    protected $casts = [
        'dat_ve_id'                  => 'integer',
        'nguoi_dung_id'              => 'integer',
        'phuong_thuc_thanh_toan_id'  => 'integer',
        'ma_giao_dich'               => 'string',
        'ma_giam_gia_id'             => 'integer',
        'tong_tien_goc'              => 'integer',   // đổi sang 'decimal:0/2' nếu cần
        'da_quet'                    => 'boolean',
        'ghe_hong'                   => 'boolean',
        'created_at'                 => 'datetime',
        'updated_at'                 => 'datetime',
    ];

    /* ----------------- Quan hệ ----------------- */

    // Vé được thanh toán
    public function datVe()
    {
        return $this->belongsTo(DatVe::class, 'dat_ve_id');
    }

    // Người dùng thực hiện thanh toán
    public function nguoiDung()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_dung_id');
    }

    // (tuỳ chọn) Phương thức thanh toán – chỉ dùng nếu có model tương ứng
    public function phuongThucThanhToan()
    {
        return $this->belongsTo(PhuongThucThanhToan::class, 'phuong_thuc_thanh_toan_id');
    }

    // (tuỳ chọn) Mã giảm giá – chỉ dùng nếu có model tương ứng
    public function maGiamGia()
    {
        return $this->belongsTo(MaGiamGia::class, 'ma_giam_gia_id');
    }

    /* ----------------- Scopes tiện ích (tuỳ dùng) ----------------- */

    public function scopeDaQuet($query)
    {
        return $query->where('da_quet', true);
    }
}
