<?php

namespace App\Events;

use App\Models\LichChieu;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LichChieuMoi implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public $lichChieu;

    public function __construct(LichChieu $lichChieu)
    {
        // load sẵn quan hệ để FE dùng luôn
        $this->lichChieu = $lichChieu->load(['phim', 'phong', 'phienBan']);
    }

    public function broadcastOn()
    {
        // channel chung cho client
        return new Channel('lich-chieu');
    }

    public function broadcastAs()
    {
        return 'lich-chieu-moi';
    }
}
