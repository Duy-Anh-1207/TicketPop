<?php

namespace App\Jobs;

use App\Models\LichChieu;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class XoaLichChieuJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        $now = Carbon::now('Asia/Ho_Chi_Minh');

        $lichHetHan = LichChieu::whereNull('deleted_at')
            ->where('gio_ket_thuc', '<', $now->subDays(5))
            ->get();

        foreach ($lichHetHan as $lich) {
            $lich->delete(); // xoá mềm

            Log::info('🗑️ Auto soft delete lịch chiếu sau 5 ngày kết thúc', [
                'lich_chieu_id' => $lich->id,
                'gio_ket_thuc'  => $lich->gio_ket_thuc,
            ]);
        }
    }
}
