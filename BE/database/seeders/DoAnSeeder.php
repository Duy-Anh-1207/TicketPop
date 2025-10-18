<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DoAnSeeder extends Seeder
{
    public function run()
    {
        DB::table('do_an')->insert([
            [
                'ten_do_an' => 'Bắp rang bơ',
                'image' => 'bap_rang_bo.jpg',
                'mo_ta' => 'Bắp rang thơm ngon giòn rụm',
                'gia_nhap' => 25000,
                'gia_ban' => 45000,
                'so_luong_ton' => 100,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ten_do_an' => 'Coca-Cola',
                'image' => 'coca_cola.jpg',
                'mo_ta' => 'Lon nước ngọt coca mát lạnh',
                'gia_nhap' => 15000,
                'gia_ban' => 30000,
                'so_luong_ton' => 200,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ten_do_an' => 'Combo Bắp + Coca',
                'image' => 'combo_bap_coca.jpg',
                'mo_ta' => 'Combo tiết kiệm bắp và coca',
                'gia_nhap' => 35000,
                'gia_ban' => 65000,
                'so_luong_ton' => 80,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
