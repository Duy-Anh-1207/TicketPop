<?php

namespace App\Http\Controllers\Admin;

use App\Models\Food;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
class FoodController extends Controller
{
    // 🔹 Lấy tất cả món ăn
    public function index()
    {
        return response()->json(Food::all(), 200);
    }

    // 🔹 Thêm món ăn mới
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

        return response()->json([
            'success' => true,
            'message' => 'Thêm món ăn thành công!',
            'data' => $food
        ], 201);
    }

    // 🔹 Lấy chi tiết 1 món ăn
    public function show($id)
    {
        $food = Food::findOrFail($id);
        return response()->json($food, 200);
    }

    // 🔹 Cập nhật món ăn
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
            'message' => 'Cập nhật món ăn thành công!',
            'data' => $food
        ], 200);
    }

    // 🔹 Xóa món ăn
    public function destroy($id)
    {
        $food = Food::findOrFail($id);
        $food->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa món ăn thành công!'
        ], 200);
    }
}
