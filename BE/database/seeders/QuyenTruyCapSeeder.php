<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuyenTruyCapSeeder extends Seeder
{
    public function run()
    {
        // Clear existing permissions
        DB::table('quyen_truy_cap')->delete();

        // Gán quyền cho Staff (vai_tro_id = 2)
        // Mỗi hàng: vai_tro_id, menu_id, function (các quyền: 1=Thêm, 2=Sửa, 3=Xóa, 4=Xem)
        
        // Lấy danh sách menu để biết ID của chúng
        $menus = DB::table('menu')->get()->keyBy('ma_chuc_nang');

        $permissions = [
            // Staff được xem Quản lý phim
            ['vai_tro_id' => 2, 'menu_id' => $menus['QL_PHIM']->id ?? 1, 'function' => '4'],
            ['vai_tro_id' => 2, 'menu_id' => $menus['DS_PHIM']->id ?? 10, 'function' => '4'],
            
            // Staff được xem Quản lý Banner
            ['vai_tro_id' => 2, 'menu_id' => $menus['QL_BANNER']->id ?? 2, 'function' => '4'],
            ['vai_tro_id' => 2, 'menu_id' => $menus['DS_BANNER']->id ?? 12, 'function' => '4'],
            
            // Staff được xem Quản lý tài khoản
            ['vai_tro_id' => 2, 'menu_id' => $menus['QL_TAI_KHOAN']->id ?? 3, 'function' => '4'],
            ['vai_tro_id' => 2, 'menu_id' => $menus['NGUOI_DUNG']->id ?? 14, 'function' => '4'],
            
            // Admin (vai_tro_id = 1) - có tất cả quyền trên tất cả menu (tùy chọn)
            // Nếu muốn explicit, có thể add ở đây, nhưng Sidebar.tsx đã xử lý Admin = toàn bộ quyền
        ];

        DB::table('quyen_truy_cap')->insert($permissions);
    }
}
