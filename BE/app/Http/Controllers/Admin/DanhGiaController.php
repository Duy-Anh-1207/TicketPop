<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DanhGia;
use App\Models\DatVeChiTiet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DanhGiaController extends Controller
{
    public function store(Request $request)
    {
        $user = Auth::user();
        $nguoiDungId = $user->id;
        $phimId = $request->phim_id;

        $request->validate([
            'phim_id' => 'required|exists:phim,id',
            'so_sao'  => 'required|integer|min:1|max:5',
            'noi_dung' => 'nullable|string'
        ]);
         // 2️⃣ Check user đã mua phim chưa
        $daMua = DatVeChiTiet::whereHas('datVe', function ($q) use ($nguoiDungId, $phimId) {
            $q->where('nguoi_dung_id', $nguoiDungId)
                ->whereHas('lichChieu', function ($q2) use ($phimId) {
                    $q2->where('phim_id', $phimId);
                })
                ->whereHas('thanhToan');
        })->exists();

        if (!$daMua) {
            return response()->json([
                'message' => 'Bạn phải mua phim này mới được đánh giá'
            ], 403);
        }

        // 3️⃣ Check đã đánh giá chưa
        $daDanhGia = DanhGia::where('nguoi_dung_id', $user->id)
            ->where('phim_id', $request->phim_id)
            ->exists();

        if ($daDanhGia) {
            return response()->json([
                'message' => 'Bạn đã đánh giá phim này rồi'
            ], 409);
        }
        // 4️⃣ Lưu đánh giá
        $danhGia = DanhGia::create([
            'nguoi_dung_id' => $user->id,
            'phim_id'       => $request->phim_id,
            'so_sao'        => $request->so_sao,
            'noi_dung'      => $request->noi_dung,
            'trang_thai'    => 1
        ]);

        return response()->json([
            'message' => 'Đánh giá thành công',
            'data'    => $danhGia
        ], 201);
    }
}
