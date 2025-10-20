<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MenuSeeder extends Seeder
{
    public function run()
    {
        DB::table('menu')->insert([
            [
                'ma_chuc_nang' => 'QL_PHIM',
                'ma_cha' => null,
                'ten_chuc_nang' => 'Quản lý phim',
                'state' => 'active',
                'stt' => '1',
                'trang_thai' => true,
            ],
            [
                'ma_chuc_nang' => 'QL_DO_AN',
                'ma_cha' => null,
                'ten_chuc_nang' => 'Quản lý đồ ăn',
                'state' => 'active',
                'stt' => '2',
                'trang_thai' => true,
            ],
            [
                'ma_chuc_nang' => 'QL_VAI_TRO',
                'ma_cha' => null,
                'ten_chuc_nang' => 'Quản lý vai trò',
                'state' => 'active',
                'stt' => '3',
                'trang_thai' => true,
            ],
        ]);
    }
}
