<?php

namespace App\Http\Controllers;

use App\Models\Food;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FoodController extends Controller
{
    // 🧾 Lấy tất cả món ăn
    public function index()
    {
        return Food::all();
    }

    // ➕ Thêm mới món ăn (có upload ảnh)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ten_do_an' => 'required|string|max:255',
            'mo_ta' => 'nullable|string',
            'gia_nhap' => 'required|numeric|min:0',
            'gia_ban' => 'required|numeric|min:0',
            'so_luong_ton' => 'required|integer|min:0',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('foods', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $food = Food::create($validated);
        return response()->json($food, 201);
    }

    // 🔍 Xem chi tiết món ăn
    public function show($id)
    {
        return Food::findOrFail($id);
    }

    // ✏️ Cập nhật món ăn (có xử lý thay ảnh)
   public function update(Request $request, $id)
{
    $food = Food::findOrFail($id);

    $validated = $request->validate([
        'ten_do_an' => 'sometimes|string|max:255',
        'mo_ta' => 'nullable|string',
        'gia_nhap' => 'sometimes|numeric|min:0',
        'gia_ban' => 'sometimes|numeric|min:0',
        'so_luong_ton' => 'sometimes|integer|min:0',
        'image' => 'nullable|image|max:2048',
    ]);

    if ($request->hasFile('image')) {
        if ($food->image && Storage::disk('public')->exists(str_replace('/storage/', '', $food->image))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $food->image));
        }

        $path = $request->file('image')->store('foods', 'public');
        $validated['image'] = '/storage/' . $path;
    }

    $food->update($validated);
    return response()->json([
        'success' => true,
        'data' => $food
    ], 200);
}

    // 🗑️ Xóa hoàn toàn món ăn (có xóa ảnh)
    public function destroy($id)
    {
        $food = Food::findOrFail($id);

        if ($food->image && Storage::disk('public')->exists(str_replace('/storage/', '', $food->image))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $food->image));
        }

        $food->forceDelete();

        return response()->json(['message' => 'Món ăn đã được xóa hoàn toàn.'], 200);
    }
}
