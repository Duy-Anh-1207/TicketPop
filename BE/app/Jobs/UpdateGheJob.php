<?php

namespace App\Jobs;

use App\Models\CheckGhe;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Log;


class UpdateGheJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $id;

    public function __construct($id)
    {
        $this->id = $id;
    }

    public function handle()
    {

        $data = CheckGhe::find($this->id);

        if ($data->trang_thai == 'dang_dat') {
            $data->update([
                'nguoi_dung_id' => null,
                'trang_thai' => 'trong'
            ]);
            Log::info('[UpdateGheJob] Kết thúc job cho ghế ' . $data);
        }
    }
}
