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
