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
    
}