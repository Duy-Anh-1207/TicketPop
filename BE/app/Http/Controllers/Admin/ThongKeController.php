<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ThongKeController extends Controller
{
    //HÀM TIỆN ÍCH 
    private function rangeDate($from, $to)
    {

        if (!$from || !$to) return null;
        return [
            $from . " 00:00:00",
            $to . " 23:59:59"
        ];
    }

    // I. THỐNG KÊ VÉ 

    // Giờ mua nhiều nhất
    public function gioMuaNhieuNhat(Request $request)
    {
        $phimId = $request->query('phim_id');
        $range = $this->rangeDate($request->from_date, $request->to_date);

        $query = DB::table('thanh_toan')
            ->join('dat_ve', 'thanh_toan.dat_ve_id', '=', 'dat_ve.id')
            ->join('lich_chieu', 'dat_ve.lich_chieu_id', '=', 'lich_chieu.id')
            ->when($phimId, fn($q) => $q->where('lich_chieu.phim_id', $phimId))
            ->when($range, fn($q) => $q->whereBetween('thanh_toan.created_at', $range))
            ->select(
                DB::raw('HOUR(thanh_toan.created_at) as gio'),
                DB::raw('COUNT(thanh_toan.id) as so_luong')
            )
            ->groupBy(DB::raw('HOUR(thanh_toan.created_at)'))
            ->orderByDesc('so_luong')
            ->limit(5)
            ->get();

        return response()->json(['status' => true, 'data' => $query]);
    }

    // Top phim bán chạy
    public function topPhimBanChay(Request $request)
    {
        $phimId = $request->query('phim_id');
        $range = $this->rangeDate($request->from_date, $request->to_date);

        $query = DB::table('thanh_toan')
            ->join('dat_ve', 'thanh_toan.dat_ve_id', '=', 'dat_ve.id')
            ->join('lich_chieu', 'dat_ve.lich_chieu_id', '=', 'lich_chieu.id')
            ->join('phim', 'lich_chieu.phim_id', '=', 'phim.id')
            ->when($phimId, fn($q) => $q->where('phim.id', $phimId))
            ->when($range, fn($q) => $q->whereBetween('thanh_toan.created_at', $range))
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

    // Phân bố loại vé
    public function phanBoLoaiVe(Request $request)
    {
        $phimId = $request->query('phim_id');
        $range = $this->rangeDate($request->from_date, $request->to_date);

        $query = DB::table('thanh_toan')
            ->join('dat_ve', 'thanh_toan.dat_ve_id', '=', 'dat_ve.id')
            ->join('dat_ve_chi_tiet', 'dat_ve.id', '=', 'dat_ve_chi_tiet.dat_ve_id')
            ->join('ghe', 'dat_ve_chi_tiet.ghe_id', '=', 'ghe.id')
            ->join('loai_ghe', 'ghe.loai_ghe_id', '=', 'loai_ghe.id')
            ->join('lich_chieu', 'dat_ve.lich_chieu_id', '=', 'lich_chieu.id')
            ->when($phimId, fn($q) => $q->where('lich_chieu.phim_id', $phimId))
            ->when($range, fn($q) => $q->whereBetween('thanh_toan.created_at', $range))
            ->select(
                'loai_ghe.ten_loai_ghe as ten_loai',
                DB::raw('COUNT(loai_ghe.id) as so_luong')
            )
            ->groupBy('loai_ghe.ten_loai_ghe')
            ->get();

        return response()->json(['status' => true, 'data' => $query]);
    }

    // Vé theo giờ hôm nay
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
            ->orderBy('gio')
            ->get();

        return response()->json(['status' => true, 'data' => $query]);
    }

    // II. THỐNG KÊ DOANH THU 

    // Thống kê ghế theo ngày
    public function GheTheoNgay(Request $request)
    {
        // 1. Khoảng ngày
        $range = $this->rangeDate(
            $request->from_date,
            $request->to_date
        );

        // 2. Tổng số ghế
        $tongSoGhe = DB::table('ghe')->count();

        // 3. Ghế bán theo NGÀY
        $gheBanTheoNgay = DB::table('dat_ve_chi_tiet')
            ->join('dat_ve', 'dat_ve_chi_tiet.dat_ve_id', '=', 'dat_ve.id')
            ->join('thanh_toan', 'dat_ve.id', '=', 'thanh_toan.dat_ve_id')
            ->when(
                $range,
                fn($q) =>
                $q->whereBetween('thanh_toan.created_at', $range)
            )
            ->select(
                DB::raw('DATE(thanh_toan.created_at) as ngay'),
                DB::raw('COUNT(DISTINCT dat_ve_chi_tiet.ghe_id) as ghe_da_ban')
            )
            ->groupBy(DB::raw('DATE(thanh_toan.created_at)'))
            ->orderBy('ngay')
            ->get();

        // 4. Build data
        $data = [];

        foreach ($gheBanTheoNgay as $item) {
            $data[] = [
                'ngay' => $item->ngay,
                'ghe_da_ban' => $item->ghe_da_ban,
                'ghe_trong' => max(0, $tongSoGhe - $item->ghe_da_ban),
            ];
        }

        return response()->json([
            'status' => true,
            'from_date' => $request->from_date,
            'to_date' => $request->to_date,
            'tong_ghe' => $tongSoGhe,
            'data' => $data
        ]);
    }

    //doanh thu phim
    public function doanhThuPhim(Request $request)
    {
        $phimId = $request->query('phim_id');
        $range = $this->rangeDate($request->from_date, $request->to_date);

        $query = DB::table('thanh_toan')
            ->join('dat_ve', 'thanh_toan.dat_ve_id', '=', 'dat_ve.id')
            ->join('lich_chieu', 'dat_ve.lich_chieu_id', '=', 'lich_chieu.id')
            ->join('phim', 'lich_chieu.phim_id', '=', 'phim.id')
            ->when($phimId, fn($q) => $q->where('phim.id', $phimId))
            ->when($range, fn($q) => $q->whereBetween('thanh_toan.created_at', $range))
            ->select(
                'phim.ten_phim',
                DB::raw('SUM(thanh_toan.tong_tien_goc) as doanh_thu')
            )
            ->groupBy('phim.ten_phim')
            ->orderByDesc('doanh_thu')
            ->get();

        return response()->json(['status' => true, 'data' => $query]);
    }
    //doanh thu đồ ăn
    public function doanhThuDoAn(Request $request)
    {
        $range = $this->rangeDate($request->from_date, $request->to_date);

        $query = DB::table('don_do_an')
            ->when($range, fn($q) => $q->whereBetween('created_at', $range))
            ->select(DB::raw('SUM(so_luong * gia_ban) as doanh_thu'))
            ->first();

        return response()->json([
            'status' => true,
            'doanh_thu_do_an' => (int)$query->doanh_thu
        ]);
    }
    //doanh thu theo tháng
    public function doanhThuTheoThang(Request $request)
    {
        $range = $this->rangeDate($request->from_date, $request->to_date);

        $query = DB::table('thanh_toan')
            ->when($range, fn($q) => $q->whereBetween('created_at', $range))
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as thang'),
                DB::raw('SUM(tong_tien_goc) as tong_doanh_thu')
            )
            ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-%m")'))
            ->orderBy('thang')
            ->get();

        return response()->json(['status' => true, 'data' => $query]);
    }
}
