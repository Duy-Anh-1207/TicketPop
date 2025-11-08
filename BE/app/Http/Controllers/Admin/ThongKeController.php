<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ThongKeController extends Controller
{
    // Thống kê doanh thu theo ngày hoặc tháng
    public function doanhThu(Request $request)
    {
        $type = $request->query('type', 'month'); // 'day' hoặc 'month'

        try {
            if ($type === 'day') {
                // Doanh thu theo ngày
                $data = DB::table('dat_ve')
                    ->select(
                        DB::raw('DATE(created_at) as label'),
                        DB::raw('SUM(tong_tien) as revenue')
                    )
                    ->groupBy(DB::raw('DATE(created_at)'))
                    ->orderBy('label', 'asc')
                    ->get();
            } else {
                // Doanh thu theo tháng
                $data = DB::table('dat_ve')
                    ->select(
                        DB::raw('DATE_FORMAT(created_at, "%Y-%m") as label'),
                        DB::raw('SUM(tong_tien) as revenue')
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
    

    // số lượng vé bán ra
    public function veBan()
    {
        try {
            $tongVeBan = DB::table('dat_ve')->count();

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
            $data = DB::table('dat_ve')
                ->join('phim', 'dat_ve.phim_id', '=', 'phim.id')
                ->select(
                    'phim.ten_phim',
                    DB::raw('SUM(dat_ve.tong_tien) as tong_doanh_thu'),
                    DB::raw('COUNT(dat_ve.id) as so_luot_dat')
                )
                ->groupBy('phim.ten_phim')
                ->orderByDesc('tong_doanh_thu')
                ->limit(5)
                ->get();

            return response()->json([
                'status' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }




}