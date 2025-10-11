<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PhienBanSeeder extends Seeder
{
    public function run()
    {
        DB::table('phien_ban')->insert([
            ['the_loai' => 'Lồng tiếng', 'created_at' => now(), 'updated_at' => now()],
            ['the_loai' => 'Phụ đề', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
