<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PhuongThucThanhToanSeeder extends Seeder
{
    public function run()
    {
        DB::table('phuong_thuc_thanh_toan')->insert([
            ['ten' => 'MOMO', 'nha_cung_cap' => 'MOMO', 'mo_ta' => 'MOMO', 'created_at' => now(), 'updated_at' => now()],
            ['ten' => 'VNPAY', 'nha_cung_cap' => 'VNPAY', 'mo_ta' => 'VNPAY', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
