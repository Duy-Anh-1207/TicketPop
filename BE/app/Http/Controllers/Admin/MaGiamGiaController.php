<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MaGiamGia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;


class MaGiamGiaController extends Controller
{
    public function index()
    {
        $data = MaGiamGia::orderBy('id', 'desc')->get();
        return response()->json($data);
    }

   public function store(Request $request)
{
    $request->validate([
        'ma' => 'required|unique:ma_giam_gia,ma',
        'phan_tram_giam' => 'nullable|numeric|min:0|max:100',
        'giam_toi_da' => 'nullable|numeric|min:0',
        'gia_tri_don_hang_toi_thieu' => 'nullable|numeric|min:0',
        'ngay_bat_dau' => 'required|date',
        'ngay_ket_thuc' => 'required|date|after_or_equal:ngay_bat_dau',
        'so_lan_su_dung' => 'nullable|integer|min:0',
        'so_lan_da_su_dung' => 'nullable|integer|min:0',
        'trang_thai' => 'required|in:CHƯA KÍCH HOẠT,KÍCH HOẠT,HẾT HẠN', // ✅ khớp enum
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    $data = $request->all();

    if ($request->hasFile('image')) {
        $data['image'] = $request->file('image')->store('ma_giam_gia', 'public');
    }

    $maGiamGia = MaGiamGia::create($data);

    return response()->json([
        'message' => 'Thêm mã giảm giá thành công',
        'data' => $maGiamGia,
    ], 201);
}


    public function show($id)
    {
        $item = MaGiamGia::findOrFail($id);
        return response()->json($item);
    }

    public function update(Request $request, $id)
    {
        // Ghi log dữ liệu nhận được
        Log::info('Dữ liệu nhận được trong update MaGiamGia:', [
            'id' => $id,
            'request_data' => $request->all(),
            'files' => $request->hasFile('image') ? $request->file('image')->getClientOriginalName() : null,
        ]);

        $item = MaGiamGia::findOrFail($id);

        $request->validate([
            'ma' => 'required|unique:ma_giam_gia,ma,' . $id,
            'phan_tram_giam' => 'nullable|numeric|min:0|max:100',
            'ngay_ket_thuc' => 'required|date|after_or_equal:ngay_bat_dau',
        ]);

        $data = $request->all();

        if ($request->hasFile('image')) {
            if ($item->image) {
                Storage::disk('public')->delete($item->image);
            }
            $data['image'] = $request->file('image')->store('ma_giam_gia', 'public');
        }

        $item->update($data);

        return response()->json(['message' => 'Cập nhật thành công', 'data' => $item]);
    }

    public function destroy($id)
    {
        $item = MaGiamGia::findOrFail($id);

        if ($item->image) {
            Storage::disk('public')->delete($item->image);
        }

        $item->delete();

        return response()->json(['message' => 'Xóa mã giảm giá thành công']);
    }
}