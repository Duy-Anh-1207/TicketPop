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

        // 1. Vé đã bán theo phim
        $veDaBan = DB::table('thanh_toan')
            ->join('dat_ve', 'thanh_toan.dat_ve_id', '=', 'dat_ve.id')
            ->join('lich_chieu', 'dat_ve.lich_chieu_id', '=', 'lich_chieu.id')
            ->join('phim', 'lich_chieu.phim_id', '=', 'phim.id')
            ->when($phimId, fn($q) => $q->where('phim.id', $phimId))
            ->when($range, fn($q) => $q->whereBetween('thanh_toan.created_at', $range))
            ->select(
                'phim.id as phim_id',
                'phim.ten_phim',
                DB::raw('COUNT(DISTINCT dat_ve.id) as ve_da_ban')
            )
            ->groupBy('phim.id', 'phim.ten_phim')
            ->orderByDesc('ve_da_ban')
            ->limit(5)
            ->get();

        // 2. Tổng vé (tổng ghế theo phim)

        $tongVe = DB::table('lich_chieu')
            ->join('phong_chieu', 'lich_chieu.phong_id', '=', 'phong_chieu.id')
            ->join('ghe', 'phong_chieu.id', '=', 'ghe.phong_id')
            ->select(
                'lich_chieu.phim_id',
                DB::raw('COUNT(ghe.id) as tong_ve')
            )
            ->groupBy('lich_chieu.phim_id')
            ->get()
            ->keyBy('phim_id');

        //3. Gộp dữ liệu

        $data = $veDaBan->map(function ($item) use ($tongVe) {
            $tong = $tongVe[$item->phim_id]->tong_ve ?? 0;

            return [
                'ten_phim'  => $item->ten_phim,
                've_da_ban' => (int) $item->ve_da_ban,
                've_trong'  => max(0, $tong - $item->ve_da_ban),
                'tong_ve'   => (int) $tong,
            ];
        });

        return response()->json([
            'status' => true,
            'data' => $data
        ]);
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

    // Thống kê ghế
    public function ThongKeGhe(Request $request)
    {
        $phimId = $request->query('phim_id');
        $range = $this->rangeDate($request->from_date, $request->to_date);

        // Tổng ghế theo phòng
        $tongGheTheoPhong = DB::table('ghe')
            ->select('phong_id', DB::raw('COUNT(id) as tong_ghe'))
            ->groupBy('phong_id');

        $query = DB::table('thanh_toan')
            ->join('dat_ve', 'thanh_toan.dat_ve_id', '=', 'dat_ve.id')
            ->join('lich_chieu', 'dat_ve.lich_chieu_id', '=', 'lich_chieu.id')
            ->join('phim', 'lich_chieu.phim_id', '=', 'phim.id')
            ->join('phong_chieu', 'lich_chieu.phong_id', '=', 'phong_chieu.id')->join('dat_ve_chi_tiet', 'dat_ve.id', '=', 'dat_ve_chi_tiet.dat_ve_id')
            ->join('ghe', 'dat_ve_chi_tiet.ghe_id', '=', 'ghe.id')
            ->joinSub($tongGheTheoPhong, 'tg', function ($join) {
                $join->on('phong_chieu.id', '=', 'tg.phong_id');
            })
            ->when($phimId, fn($q) => $q->where('phim.id', $phimId))
            ->when($range, fn($q) => $q->whereBetween('thanh_toan.created_at', $range))
            ->select(
                DB::raw('DATE(thanh_toan.created_at) as ngay'),
                'phim.ten_phim',
                'phong_chieu.ten_phong',
                DB::raw('COUNT(DISTINCT dat_ve_chi_tiet.ghe_id) as ghe_da_ban'),
                DB::raw('tg.tong_ghe as tong_ghe')
            )
            ->groupBy(
                DB::raw('DATE(thanh_toan.created_at)'),
                'phim.ten_phim',
                'phong_chieu.ten_phong',
                'tg.tong_ghe'
            )
            ->orderBy('ngay')
            ->get();

        // build data
        $data = $query->map(function ($item) {
            return [
                'ngay'        => $item->ngay,
                'ten_phim'    => $item->ten_phim,
                'ten_phong'   => $item->ten_phong,
                'ghe_da_ban'  => (int)$item->ghe_da_ban,
                'ghe_trong'   => max(0, $item->tong_ghe - $item->ghe_da_ban),
                'tong_ghe'    => (int)$item->tong_ghe,
            ];
        });

        return response()->json([
            'status' => true,
            'from_date' => $request->from_date,
            'to_date' => $request->to_date,
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
