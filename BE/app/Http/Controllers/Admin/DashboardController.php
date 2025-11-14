<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    // Doanh thu theo ngày / tháng 
    public function doanhThu(Request $request)
    {
        $type = $request->query('type', 'month'); // 'day' hoặc 'month'

        try {
            $query = DB::table('thanh_toan');

            if ($type === 'day') {
                $data = $query
                    ->select(
                        DB::raw('DATE(created_at) as label'),
                        DB::raw('SUM(tong_tien_goc) as revenue')
                    )
                    ->groupBy(DB::raw('DATE(created_at)'))
                    ->orderBy('label', 'asc')
                    ->get();
            } else {
                $data = $query
                    ->select(
                        DB::raw('DATE_FORMAT(created_at, "%Y-%m") as label'),
                        DB::raw('SUM(tong_tien_goc) as revenue')
                    )
                    ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-%m")'))
                    ->orderBy('label', 'asc')
                    ->get();
            }

            return response()->json([
                'status' => true,
                'type' => $type,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Số lượng vé bán ra
    public function veBan()
    {
        try {
            $tongVeBan = DB::table('thanh_toan')->count();

            return response()->json([
                'status' => true,
                'tong_ve_ban' => $tongVeBan,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Top 5 phim có doanh thu cao nhất 
    public function topPhim()
    {
        try {
            $data = DB::table('thanh_toan')
                ->join('dat_ve', 'thanh_toan.dat_ve_id', '=', 'dat_ve.id')
                ->join('lich_chieu', 'dat_ve.lich_chieu_id', '=', 'lich_chieu.id')
                ->join('phim', 'lich_chieu.phim_id', '=', 'phim.id')
                ->select(
                    'phim.ten_phim',
                    'phim.anh_poster',
                    DB::raw('SUM(thanh_toan.tong_tien_goc) as tong_doanh_thu'),
                    DB::raw('COUNT(thanh_toan.id) as tong_ve')
                )
                ->groupBy('phim.id', 'phim.ten_phim', 'phim.anh_poster')
                ->orderByDesc('tong_doanh_thu')
                ->limit(5)
                ->get();

            $data = $data->map(function ($item) {
                return [
                    'ten_phim' => $item->ten_phim,
                    'anh_poster' => $item->anh_poster,
                    'tong_doanh_thu' => (int) $item->tong_doanh_thu,
                    'tong_ve' => (int) $item->tong_ve,
                ];
            });

            return response()->json([
                'status' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // Doanh thu đồ ăn 
    public function doAnBanRa()
    {
        try {
            $tong = DB::table('don_do_an')->sum('so_luong');

            return response()->json([
                'status' => true,
                'tong_do_an_ban_ra' => (int) $tong
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Tổng doanh thu
    public function tongDoanhThu()
    {
        try {
            $tong = DB::table('thanh_toan')->sum('tong_tien_goc');

            return response()->json([
                'status' => true,
                'tong_doanh_thu' => (float) $tong
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Khách hàng mới trong tháng 
    public function khachHangMoi()
    {
        try {
            $soLuong = DB::table('nguoi_dung')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();

            return response()->json([
                'status' => true,
                'khach_hang_moi' => $soLuong
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
