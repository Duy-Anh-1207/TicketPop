<?php

namespace App\Jobs;

use App\Models\DatVe;
use App\Models\CheckGhe;
use App\Models\DoAn;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class XoaDonHang implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $datVeId;

    /**
     * Create a new job instance.
     *
     * @param int $datVeId
     */
    public function __construct(int $datVeId)
    {
        $this->datVeId = $datVeId;
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        $datVe = DatVe::with(['datVeChiTiet', 'donDoAn', 'thanhToan'])->find($this->datVeId);

        if (!$datVe) {
            return; // vé không tồn tại
        }

        // Nếu đã thanh toán thì không xóa
        if ($datVe->thanhToan && $datVe->thanhToan->trang_thai === 'da_thanh_toan') {
            return;
        }

        DB::transaction(function() use ($datVe) {
            // 1️⃣ Hoàn ghế
            foreach ($datVe->datVeChiTiet as $ct) {
                CheckGhe::where('lich_chieu_id', $datVe->lich_chieu_id)
                    ->where('ghe_id', $ct->ghe_id)
                    ->update([
                        'trang_thai' => 'trong',
                        'nguoi_dung_id' => null,
                        'expires_at' => null
                    ]);
            }

            // 2️⃣ Hoàn đồ ăn về kho
            foreach ($datVe->donDoAn as $don) {
                $doAn = DoAn::find($don->do_an_id);
                if ($doAn) {
                    $doAn->update([
                        'so_luong_ton' => $doAn->so_luong_ton + $don->so_luong
                    ]);
                }
            }

            // 3️⃣ Xóa đơn chi tiết và vé
            $datVe->datVeChiTiet()->delete();
            $datVe->donDoAn()->delete();
            $datVe->delete();
        });
    }
}
