<?php

namespace App\Http\Controllers\Admin;

use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;

class BannerController extends Controller
{
    // Lấy tất cả banner
    public function index()
    {
        return Banner::all();
    }

    // Thêm mới banner (có upload ảnh)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'link_url' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('banners', 'public');
            $validated['image_url'] = '/storage/' . $path;
        }

        $banner = Banner::create($validated);
        return response()->json($banner, 201);
    }

    // Xem chi tiết banner
    public function show($id)
    {
        return Banner::findOrFail($id);
    }

    // Cập nhật banner
    public function update(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'link_url' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            // Xóa ảnh cũ nếu có
            if ($banner->image_url && Storage::disk('public')->exists(str_replace('/storage/', '', $banner->image_url))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $banner->image_url));
            }

            $path = $request->file('image')->store('banners', 'public');
            $validated['image_url'] = '/storage/' . $path;
        }

        $banner->update($validated);
        return response()->json($banner);
    }

    // Xóa hoàn toàn banner (cả DB và ảnh)
    public function destroy($id)
    {
        $banner = Banner::findOrFail($id);

        // Xóa ảnh trong thư mục public/storage nếu có
        if ($banner->image_url && Storage::disk('public')->exists(str_replace('/storage/', '', $banner->image_url))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $banner->image_url));
        }

        // Xóa hoàn toàn trong database
        $banner->forceDelete();

        return response()->json(['message' => 'Banner đã được xóa hoàn toàn.'], 200);
    }
}
