<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ThongKeController extends Controller
{
    // ==================== I. THỐNG KÊ VÉ ====================

    // Các giờ được mua nhiều nhất
    public function gioMuaNhieuNhat(Request $request)
    {
        $phimId = $request->query('phim_id');
        $ngay = $request->query('ngay'); // dạng YYYY-MM-DD

        $query = DB::table('thanh_toan')
            ->join('dat_ve', 'thanh_toan.dat_ve_id', '=', 'dat_ve.id')
            ->join('lich_chieu', 'dat_ve.lich_chieu_id', '=', 'lich_chieu.id')
            ->when($phimId, fn($q) => $q->where('lich_chieu.phim_id', $phimId))
            ->when($ngay, fn($q) => $q->whereDate('thanh_toan.created_at', $ngay))
            ->select(
                DB::raw('HOUR(thanh_toan.created_at) as gio'),
                DB::raw('COUNT(thanh_toan.id) as so_luong')
            )
            ->groupBy(DB::raw('HOUR(thanh_toan.created_at)'))
            ->orderByDesc('so_luong')
            ->limit(5)
            ->get();

        return response()->json([
            'status' => true,
            'data' => $query
        ]);
    }

    // Top phim bán chạy
    public function topPhimBanChay(Request $request)
    {
        $phimId = $request->query('phim_id');
        $ngay = $request->query('ngay');

        $query = DB::table('thanh_toan')
            ->join('dat_ve', 'thanh_toan.dat_ve_id', '=', 'dat_ve.id')
            ->join('lich_chieu', 'dat_ve.lich_chieu_id', '=', 'lich_chieu.id')
            ->join('phim', 'lich_chieu.phim_id', '=', 'phim.id')
            ->when($phimId, fn($q) => $q->where('phim.id', $phimId))
            ->when($ngay, fn($q) => $q->whereDate('thanh_toan.created_at', $ngay))
            ->select(
                'phim.ten_phim',
                'phim.anh_poster',
                DB::raw('COUNT(thanh_toan.id) as tong_ve'),
                DB::raw('SUM(thanh_toan.tong_tien_goc) as tong_tien')
            )
            ->groupBy('phim.id', 'phim.ten_phim', 'phim.anh_poster')
            ->orderByDesc('tong_ve')
            ->limit(5)
            ->get();

        return response()->json(['status' => true, 'data' => $query]);
    }

    // Phân bố theo loại vé (thường, VIP)
    public function phanBoLoaiVe(Request $request)
    {
        $phimId = $request->query('phim_id');
        $ngay = $request->query('ngay');

        $query = DB::table('thanh_toan')
            ->join('dat_ve', 'thanh_toan.dat_ve_id', '=', 'dat_ve.id')
            ->join('dat_ve_chi_tiet', 'dat_ve.id', '=', 'dat_ve_chi_tiet.dat_ve_id')
            ->join('ghe', 'dat_ve_chi_tiet.ghe_id', '=', 'ghe.id')
            ->join('loai_ghe', 'ghe.loai_ghe_id', '=', 'loai_ghe.id')
            ->join('lich_chieu', 'dat_ve.lich_chieu_id', '=', 'lich_chieu.id')
            ->when($phimId, fn($q) => $q->where('lich_chieu.phim_id', $phimId))
            ->when($ngay, fn($q) => $q->whereDate('thanh_toan.created_at', $ngay))
            ->select(
                'loai_ghe.ten_loai_ghe as ten_loai',
                DB::raw('COUNT(loai_ghe.id) as so_luong')
            )
            ->groupBy('loai_ghe.ten_loai_ghe')
            ->get();

        return response()->json(['status' => true, 'data' => $query]);
    }

    // Số lượng vé bán ra theo giờ trong hôm nay
    public function veTheoGioHomNay(Request $request)
    {
        $phimId = $request->query('phim_id');

        $query = DB::table('thanh_toan')
            ->join('dat_ve', 'thanh_toan.dat_ve_id', '=', 'dat_ve.id')
            ->join('lich_chieu', 'dat_ve.lich_chieu_id', '=', 'lich_chieu.id')
            ->when($phimId, fn($q) => $q->where('lich_chieu.phim_id', $phimId))
            ->whereDate('thanh_toan.created_at', now()->toDateString())
            ->select(
                DB::raw('HOUR(thanh_toan.created_at) as gio'),
                DB::raw('COUNT(thanh_toan.id) as so_luong')
            )
            ->groupBy(DB::raw('HOUR(thanh_toan.created_at)'))
            ->orderBy('gio', 'asc')
            ->get();

        return response()->json(['status' => true, 'data' => $query]);
    }

    // ==================== II. THỐNG KÊ DOANH THU ====================

    // Tỷ lệ phương thức thanh toán
    public function tyLePhuongThucThanhToan(Request $request)
    {
        try {
            $phimId = $request->query('phim_id');
            $ngay = $request->query('ngay');

            $query = DB::table('thanh_toan')
                ->leftJoin('phuong_thuc_thanh_toan', 'thanh_toan.phuong_thuc_thanh_toan_id', '=', 'phuong_thuc_thanh_toan.id')
                ->leftJoin('dat_ve', 'thanh_toan.dat_ve_id', '=', 'dat_ve.id')
                ->leftJoin('lich_chieu', 'dat_ve.lich_chieu_id', '=', 'lich_chieu.id')
                ->when($phimId, fn($q) => $q->where('lich_chieu.phim_id', $phimId))
                ->when($ngay, fn($q) => $q->whereDate('thanh_toan.created_at', $ngay))
                ->select(
                    DB::raw('COALESCE(phuong_thuc_thanh_toan.ten, "Khác") as ten'),
                    DB::raw('COUNT(thanh_toan.id) as so_luong')
                )
                ->groupBy('ten')
                ->get();

            return response()->json(['status' => true, 'data' => $query]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }


    // Doanh thu phim
    public function doanhThuPhim(Request $request)
    {
        $phimId = $request->query('phim_id');
        $ngay = $request->query('ngay');

        $query = DB::table('thanh_toan')
            ->join('dat_ve', 'thanh_toan.dat_ve_id', '=', 'dat_ve.id')
            ->join('lich_chieu', 'dat_ve.lich_chieu_id', '=', 'lich_chieu.id')
            ->join('phim', 'lich_chieu.phim_id', '=', 'phim.id')
            ->when($phimId, fn($q) => $q->where('phim.id', $phimId))
            ->when($ngay, fn($q) => $q->whereDate('thanh_toan.created_at', $ngay))
            ->select(
                'phim.ten_phim',
                DB::raw('SUM(thanh_toan.tong_tien_goc) as doanh_thu')
            )
            ->groupBy('phim.ten_phim')
            ->orderByDesc('doanh_thu')
            ->get();

        return response()->json(['status' => true, 'data' => $query]);
    }

    // Doanh thu đồ ăn
    public function doanhThuDoAn(Request $request)
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

    // Doanh thu theo tháng
    public function doanhThuTheoThang()
    {
        $data = DB::table('thanh_toan')
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as thang'),
                DB::raw('SUM(tong_tien_goc) as tong_doanh_thu')
            )
            ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-%m")'))
            ->orderBy('thang', 'asc')
            ->get();

        return response()->json(['status' => true, 'data' => $data]);
    }
}
