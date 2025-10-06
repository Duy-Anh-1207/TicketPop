<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Phim;

class PhimSeeder extends Seeder
{
    public function run()
    {
        Phim::create([
            'ten_phim' => 'Avengers: Endgame',
            'mo_ta' => 'Cuộc chiến cuối cùng của các siêu anh hùng.',
            'thoi_luong' => 181,
            'trailer' => 'https://youtube.com/trailer',
            'ngon_ngu' => 'Tiếng Anh',
            'quoc_gia' => 'Mỹ',
            'anh_poster' => 'avengers.jpg',
            'ngay_cong_chieu' => '2019-04-26',
            'ngay_ket_thuc' => '2019-06-30',
            'do_tuoi_gioi_han' => '13+',
            'loai_suat_chieu' => 'Thường',
        ]);
    }
}
