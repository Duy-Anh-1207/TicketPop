<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MaGiamGia;
use Illuminate\Support\Facades\Storage;

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
            'ngay_bat_dau' => 'required|date',
            'ngay_ket_thuc' => 'required|date|after_or_equal:ngay_bat_dau',
        ]);

        $data = $request->all();

        // Xử lý ảnh
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('ma_giam_gia', 'public');
        }

        $maGiamGia = MaGiamGia::create($data);

        return response()->json(['message' => 'Thêm mã giảm giá thành công', 'data' => $maGiamGia], 201);
    }

    public function show($id)
    {
        $item = MaGiamGia::findOrFail($id);
        return response()->json($item);
    }

    public function update(Request $request, $id)
    {
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
