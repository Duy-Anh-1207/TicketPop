<?php

namespace App\Jobs;

use App\Models\DatVe;
use App\Models\ThanhToan;
use App\Models\CheckGhe;
use App\Models\DoAn;
use Illuminate\Bus\Queueable;
use Illuminate\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable as BusDispatchable;

class XoaDonHang implements ShouldQueue
{
    use BusDispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $id;

    public function __construct($datVeId)
    {
        $this->id = $datVeId;
    }

    public function handle(): void
    {
        DB::transaction(function () {

            $datVe = DatVe::with(['chiTiet', 'donDoAn'])
                ->lockForUpdate()
                ->find($this->id);

            if (!$datVe) return;

            // Nếu đã thanh toán => giữ nguyên
            $exists = ThanhToan::where('dat_ve_id', $this->id)->exists();
            if ($exists) {
                Log::info("Đơn {$this->id} đã thanh toán => không xoá.");
                return;
            }

            // Trả ghế
            foreach ($datVe->chiTiet as $ct) {
                CheckGhe::where('lich_chieu_id', $datVe->lich_chieu_id)
                    ->where('ghe_id', $ct->ghe_id)
                    ->update([
                        'trang_thai' => 'trong',
                        'nguoi_dung_id' => null,
                        'expires_at' => null,
                    ]);
            }

            // Hoàn đồ ăn
            foreach ($datVe->donDoAn as $item) {
                DoAn::where('id', $item->do_an_id)
                    ->increment('so_luong_ton', $item->so_luong);
            }

            // Xoá chi tiết
            $datVe->chiTiet()->delete();
            $datVe->donDoAn()->delete();

            // Xoá đơn
            $datVe->delete();

            Log::info(">>> ĐÃ XOÁ đơn {$this->id} vì KHÔNG thanh toán trong 5 phút.");
        });
    }
}
