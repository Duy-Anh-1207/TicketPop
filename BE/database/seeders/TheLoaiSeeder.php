<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TheLoaiSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('the_loai')->insert([
            ['ten_the_loai' => 'Hành động', 'created_at' => now(), 'updated_at' => now()],
            ['ten_the_loai' => 'Tình cảm', 'created_at' => now(), 'updated_at' => now()],
            ['ten_the_loai' => 'Kinh dị', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
