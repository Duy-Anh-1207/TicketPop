<?php

namespace App\Jobs;

use App\Models\LichChieu;
use App\Models\GiaVe;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TangGiaVeTheoNgayJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // Bạn có thể chỉnh các thông số này ngay trong Job
    private string $tz = 'Asia/Ho_Chi_Minh';
    private int $daysAhead = 60;      // áp dụng cho lịch chiếu từ hôm nay tới N ngày tới
    private int $rescheduleMinutes = 1; // job tự chạy lại sau N phút (để tự động)

    public function handle()
    {
        $now = Carbon::now($this->tz);

        // ✅ Danh sách ngày lễ/tết (Y-m-d) - tự điền theo năm
        $ngayLe = [
            '2025-01-01',
            '2025-04-30',
            '2025-05-01',
            '2025-09-02',
            '2026-01-01',
            // Tết âm lịch: tự điền theo năm
            // '2025-01-29', '2025-01-30', ...
        ];

        /**
         * ✅ Chống “đâm nhau” khi có nhiều worker / job bị chạy trùng
         * - lock 1 phút là đủ cho 1 lượt xử lý
         */
        $lock = Cache::lock('lock:tang_gia_ve_job', 60);
        if (!$lock->get()) {
            Log::info('⏭️ TangGiaVeTheoNgayJob: đang có tiến trình khác chạy, bỏ qua lượt này');
            $this->reschedule($now);
            return;
        }

        try {
            $from = $now->copy()->startOfDay();
            $to   = $now->copy()->addDays($this->daysAhead)->endOfDay();

            $updatedRows = 0;

            // ✅ Lấy lịch chiếu còn hiệu lực (chưa kết thúc) trong khoảng ngày cần xử lý
            LichChieu::query()
                ->whereNull('deleted_at')
                ->where('gio_ket_thuc', '>', $now)
                ->whereBetween('gio_chieu', [$from, $to])
                ->select(['id', 'gio_chieu'])
                ->chunkById(200, function ($lichChunk) use ($ngayLe, &$updatedRows) {

                    foreach ($lichChunk as $lich) {
                        $ngayChieu = Carbon::parse($lich->gio_chieu, $this->tz);
                        $dateStr   = $ngayChieu->toDateString();

                        // 🎯 Ưu tiên lễ/tết trước, rồi mới tới cuối tuần
                        if (in_array($dateStr, $ngayLe, true)) {
                            $heSo = 2.0;
                        } elseif ($ngayChieu->isWeekend()) { // ✅ T7 + CN
                            $heSo = 1.5;
                        } else {
                            $heSo = 1.0; // ngày thường => reset về giá gốc
                        }

                        DB::transaction(function () use ($lich, $heSo, &$updatedRows) {
                            $giaVes = GiaVe::query()
                                ->where('lich_chieu_id', $lich->id)
                                ->lockForUpdate()
                                ->get(['id', 'gia_ve']);

                            foreach ($giaVes as $gv) {
                                $baseKey = "gia_ve:base:{$gv->id}";
                                $giaGoc = Cache::rememberForever($baseKey, function () use ($gv) {
                                    return (float) $gv->gia_ve;
                                });

                                $giaMoi = (int) round($giaGoc * $heSo);

                                if ((int)$gv->gia_ve !== $giaMoi) {
                                    $gv->update(['gia_ve' => $giaMoi]);
                                    $updatedRows++;
                                }
                            }
                        });

                        Log::info('🎫 Áp dụng hệ số giá vé', [
                            'lich_chieu_id' => $lich->id,
                            'date'          => $dateStr,
                            'he_so'         => $heSo,
                        ]);
                    }
                });

            Log::info('✅ TangGiaVeTheoNgayJob DONE', [
                'updated_rows' => $updatedRows,
                'range_days'   => $this->daysAhead,
                'time'         => $now->toDateTimeString(),
            ]);
        } catch (\Throwable $e) {
            Log::error('❌ TangGiaVeTheoNgayJob ERROR', [
                'message' => $e->getMessage(),
                'line'    => $e->getLine(),
                'file'    => $e->getFile(),
            ]);
        } finally {
            optional($lock)->release();
            $this->reschedule($now);
        }
    }

    private function reschedule(Carbon $now): void
    {
        self::dispatch()->delay($now->copy()->addMinutes($this->rescheduleMinutes));
    }
}
