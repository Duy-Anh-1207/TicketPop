<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MenuSeeder extends Seeder
{
    public function run()
    {
        // Delete dependent records first (FK constraint from quyen_truy_cap)
        DB::table('quyen_truy_cap')->delete();
        DB::table('menu')->delete();

        DB::table('menu')->insert([
            // === MENU CHA ===
            [
                'ma_chuc_nang' => 'QL_PHIM',
                'ma_cha'       => null,
                'ten_chuc_nang'=> 'Quản lý phim',
                'path'         => '',
                'state'        => 'active',
                'stt'          => 1,
                'trang_thai'   => true,
            ],
            [
                'ma_chuc_nang' => 'DASHBOARD',
                'ma_cha'       => null,
                'ten_chuc_nang'=> 'Dashboard',
                'path'         => 'dashboard',
                'state'        => 'active',
                'stt'          => 1,
                'trang_thai'   => true,
            ],
            [
                'ma_chuc_nang' => 'QL_VE',
                'ma_cha'       => null,
                'ten_chuc_nang'=> 'Quản lý vé',
                'path'         => '',
                'state'        => 'active',
                'stt'          => 2,
                'trang_thai'   => true,
            ],
            [
                'ma_chuc_nang' => 'QL_BANNER',
                'ma_cha'       => null,
                'ten_chuc_nang'=> 'Quản lý Banner',
                'path'         => '',
                'state'        => 'active',
                'stt'          => 2,
                'trang_thai'   => true,
            ],
            [
                'ma_chuc_nang' => 'QL_TAI_KHOAN',
                'ma_cha'       => null,
                'ten_chuc_nang'=> 'Quản lý tài khoản',
                'path'         => '',
                'state'        => 'active',
                'stt'          => 3,
                'trang_thai'   => true,
            ],
            [
                'ma_chuc_nang' => 'QL_PHONG_CHIEU',
                'ma_cha'       => null,
                'ten_chuc_nang'=> 'Quản lý phòng chiếu',
                'path'         => '',
                'state'        => 'active',
                'stt'          => 4,
                'trang_thai'   => true,
            ],
            [
                'ma_chuc_nang' => 'QL_DICH_VU',
                'ma_cha'       => null,
                'ten_chuc_nang'=> 'Quản lý dịch vụ',
                'path'         => '',
                'state'        => 'active',
                'stt'          => 5,
                'trang_thai'   => true,
            ],
            [
                'ma_chuc_nang' => 'QL_LICH_CHIEU',
                'ma_cha'       => null,
                'ten_chuc_nang'=> 'Quản lý lịch chiếu',
                'path'         => '',
                'state'        => 'active',
                'stt'          => 6,
                'trang_thai'   => true,
            ],
            [
                'ma_chuc_nang' => 'QL_VOUCHER',
                'ma_cha'       => null,
                'ten_chuc_nang'=> 'Quản lý voucher',
                'path'         => '',
                'state'        => 'active',
                'stt'          => 7,
                'trang_thai'   => true,
            ],
            [
                'ma_chuc_nang' => 'QL_TIN_TUC',
                'ma_cha'       => null,
                'ten_chuc_nang'=> 'Quản lý tin tức',
                'path'         => '',
                'state'        => 'active',
                'stt'          => 8,
                'trang_thai'   => true,
            ],
            [
                'ma_chuc_nang' => 'THONG_KE',
                'ma_cha'       => null,
                'ten_chuc_nang'=> 'Thống kê',
                'path'         => '',
                'state'        => 'active',
                'stt'          => 9,
                'trang_thai'   => true,
            ],

            // === MENU CON ===
            // Quản lý phim
            [
                'ma_chuc_nang' => 'DS_PHIM',
                'ma_cha'       => 'QL_PHIM',
                'ten_chuc_nang'=> 'Danh sách phim',
                'path'         => '/admin/phim',
                'state'        => 'active',
                'stt'          => 1,
                'trang_thai'   => true,
            ],
            [
                'ma_chuc_nang' => 'QL_THE_LOAI',
                'ma_cha'       => 'QL_PHIM',
                'ten_chuc_nang'=> 'Quản lý thể loại',
                'path'         => '/admin/the-loai',
                'state'        => 'active',
                'stt'          => 2,
                'trang_thai'   => true,
            ],

            // Quản lý vé
            [
                'ma_chuc_nang' => 'DS_VE',
                'ma_cha'       => 'QL_VE',
                'ten_chuc_nang'=> 'Danh sách vé',
                'path'         => '/admin/ve',
                'state'        => 'active',
                'stt'          => 1,
                'trang_thai'   => true,
            ],

            // Quản lý Banner
            [
                'ma_chuc_nang' => 'DS_BANNER',
                'ma_cha'       => 'QL_BANNER',
                'ten_chuc_nang'=> 'Danh sách banner',
                'path'         => '/admin/banners',
                'state'        => 'active',
                'stt'          => 1,
                'trang_thai'   => true,
            ],
            [
                'ma_chuc_nang' => 'THEM_BANNER',
                'ma_cha'       => 'QL_BANNER',
                'ten_chuc_nang'=> 'Thêm mới banner',
                'path'         => '/admin/banners/them-moi',
                'state'        => 'active',
                'stt'          => 2,
                'trang_thai'   => true,
            ],

            // Quản lý tài khoản
            [
                'ma_chuc_nang' => 'NGUOI_DUNG',
                'ma_cha'       => 'QL_TAI_KHOAN',
                'ten_chuc_nang'=> 'Người dùng',
                'path'         => '/admin/nguoi-dung',
                'state'        => 'active',
                'stt'          => 1,
                'trang_thai'   => true,
            ],
            [
                'ma_chuc_nang' => 'VAI_TRO',
                'ma_cha'       => 'QL_TAI_KHOAN',
                'ten_chuc_nang'=> 'Vai trò',
                'path'         => '/admin/vai-tro',
                'state'        => 'active',
                'stt'          => 2,
                'trang_thai'   => true,
            ],

            // Quản lý phòng chiếu
            [
                'ma_chuc_nang' => 'PHONG_CHIEU_DA_XB',
                'ma_cha'       => 'QL_PHONG_CHIEU',
                'ten_chuc_nang'=> 'Phòng chiếu đã xuất bản',
                'path'         => '/admin/roomxb',
                'state'        => 'active',
                'stt'          => 1,
                'trang_thai'   => true,
            ],
            [
                'ma_chuc_nang' => 'PHONG_CHIEU_CHUA_XB',
                'ma_cha'       => 'QL_PHONG_CHIEU',
                'ten_chuc_nang'=> 'Phòng chiếu chưa xuất bản',
                'path'         => '/admin/roomcxb',
                'state'        => 'active',
                'stt'          => 2,
                'trang_thai'   => true,
            ],
            [
                'ma_chuc_nang' => 'THEM_PHONG_CHIEU',
                'ma_cha'       => 'QL_PHONG_CHIEU',
                'ten_chuc_nang'=> 'Thêm mới phòng chiếu',
                'path'         => '/admin/room/them-moi',
                'state'        => 'active',
                'stt'          => 3,
                'trang_thai'   => true,
            ],

            // Quản lý dịch vụ
            [
                'ma_chuc_nang' => 'QL_DO_AN',
                'ma_cha'       => 'QL_DICH_VU',
                'ten_chuc_nang'=> 'Quản lý đồ ăn',
                'path'         => '/admin/foods',
                'state'        => 'active',
                'stt'          => 1,
                'trang_thai'   => true,
            ],
            [
                'ma_chuc_nang' => 'THEM_DO_AN',
                'ma_cha'       => 'QL_DICH_VU',
                'ten_chuc_nang'=> 'Thêm mới đồ ăn',
                'path'         => '/admin/foods/them-moi',
                'state'        => 'active',
                'stt'          => 2,
                'trang_thai'   => true,
            ],
            [
                'ma_chuc_nang' => 'QL_MENU_DV',
                'ma_cha'       => 'QL_DICH_VU',
                'ten_chuc_nang'=> 'Quản lý menu',
                'path'         => '/admin/menu',
                'state'        => 'active',
                'stt'          => 3,
                'trang_thai'   => true,
            ],

            // Quản lý lịch chiếu
            [
                'ma_chuc_nang' => 'DS_LICH_CHIEU',
                'ma_cha'       => 'QL_LICH_CHIEU',
                'ten_chuc_nang'=> 'Danh sách lịch chiếu',
                'path'         => '/admin/lich-chieu',
                'state'        => 'active',
                'stt'          => 1,
                'trang_thai'   => true,
            ],
            [
                'ma_chuc_nang' => 'THEM_LICH_CHIEU',
                'ma_cha'       => 'QL_LICH_CHIEU',
                'ten_chuc_nang'=> 'Thêm mới lịch chiếu',
                'path'         => '/admin/lich-chieu/them-moi',
                'state'        => 'active',
                'stt'          => 2,
                'trang_thai'   => true,
            ],
            [
                'ma_chuc_nang' => 'DELTE_LICH_CHIEU',
                'ma_cha'       => 'QL_LICH_CHIEU',
                'ten_chuc_nang'=> 'Danh sách xoá mềm',
                'path'         => '/admin/lich-chieu/deleted',
                'state'        => 'active',
                'stt'          => 2,
                'trang_thai'   => true,
            ],

            // Quản lý voucher
            [
                'ma_chuc_nang' => 'DS_VOUCHER',
                'ma_cha'       => 'QL_VOUCHER',
                'ten_chuc_nang'=> 'Danh sách voucher',
                'path'         => '/admin/vouchers',
                'state'        => 'active',
                'stt'          => 1,
                'trang_thai'   => true,
            ],

            // Quản lý tin tức
            [
                'ma_chuc_nang' => 'DS_TIN_TUC',
                'ma_cha'       => 'QL_TIN_TUC',
                'ten_chuc_nang'=> 'Danh sách tin tức',
                'path'         => '/admin/tin-tuc',
                'state'        => 'active',
                'stt'          => 1,
                'trang_thai'   => true,
            ],

            // Thống kê
            [
                'ma_chuc_nang' => 'TKV_TONG_QUAN',
                'ma_cha'       => 'THONG_KE',
                'ten_chuc_nang'=> 'Thống kê vé',
                'path'         => '/admin/thong-ke/ve',
                'state'        => 'active',
                'stt'          => 1,
                'trang_thai'   => true,
            ],
            [
                'ma_chuc_nang' => 'TKDT_TONG_QUAN',
                'ma_cha'       => 'THONG_KE',
                'ten_chuc_nang'=> 'Thống kê doanh thu',
                'path'         => '/admin/thong-ke/doanh-thu',
                'state'        => 'active',
                'stt'          => 1,
                'trang_thai'   => true,
            ],
        ]);
    }
}
