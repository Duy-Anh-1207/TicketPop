<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Phim;
use Illuminate\Http\Request;

class LocPhimController extends Controller
{
    /**
     * API lọc phim theo thể loại hoặc suất chiếu
     * Nếu không truyền gì => trả về phim mới nhất
     */
    public function index(Request $request)
    {
        $query = Phim::query();

        // Lọc theo thể loại
        if ($request->has('the_loai_id') && $request->the_loai_id != '') {
            $query->whereJsonContains('the_loai_id', (int) $request->the_loai_id);
        }

        // Lọc theo loại suất chiếu
        if ($request->has('loai_suat_chieu') && $request->loai_suat_chieu != '') {
            $query->where('loai_suat_chieu', $request->loai_suat_chieu);
        }

        // Sắp xếp phim mới nhất
        $phim = $query->orderBy('created_at', 'desc')->get();

        // Nếu không có phim
        if ($phim->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy phim phù hợp!'
            ], 404);
        }

        // Trả dữ liệu phim
        return response()->json([
            'status' => true,
            'message' => 'Lọc phim thành công!',
            'data' => $phim
        ]);
    }
}
