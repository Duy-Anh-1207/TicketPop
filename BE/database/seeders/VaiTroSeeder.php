<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VaiTroSeeder extends Seeder
{
    public function run()
    {
        DB::table('vai_tro')->insert([
            ['ten_vai_tro' => 'Admin', 'mo_ta' => 'Quản trị hệ thống', 'created_at' => now(), 'updated_at' => now()],
            ['ten_vai_tro' => 'Nhân viên', 'mo_ta' => 'Quản lý rạp, suất chiếu', 'created_at' => now(), 'updated_at' => now()],
            ['ten_vai_tro' => 'Khách hàng', 'mo_ta' => 'Người dùng đặt vé', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
