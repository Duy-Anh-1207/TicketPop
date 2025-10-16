<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    // Lấy danh sách người dùng
    public function index()
    {
        $users = User::with('vaiTro')->get();

        $data = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'ten' => $user->ten,
                'email' => $user->email,
                'so_dien_thoai' => $user->so_dien_thoai,
                'trang_thai' => $user->trang_thai,
                'vai_tro' => $user->vaiTro ? $user->vaiTro->ten_vai_tro : null,
                'anh_dai_dien' => $user->anh_dai_dien
                    ? Storage::url($user->anh_dai_dien)
                    : null,
                'created_at' => $user->created_at,
            ];
        });

        return response()->json($data);
    }

    // Thêm người dùng mới
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ten' => 'required|string|max:255',
            'email' => 'required|email|unique:nguoi_dung,email',
            'so_dien_thoai' => 'nullable|string|max:20',
            'password' => 'required|string|min:6',
            'trang_thai' => 'required|in:online,offline',
            'vai_tro_id' => 'required|integer|exists:vai_tro,id',
            'anh_dai_dien' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',
        ]);

        // Lưu ảnh nếu có
        $path = null;
        if ($request->hasFile('anh_dai_dien')) {
            $path = $request->file('anh_dai_dien')->store('uploads/avatar', 'public');
        }

        $user = User::create([
            'ten' => $validated['ten'],
            'email' => $validated['email'],
            'so_dien_thoai' => $validated['so_dien_thoai'] ?? null,
            'password' => Hash::make($validated['password']),
            'trang_thai' => $validated['trang_thai'],
            'vai_tro_id' => $validated['vai_tro_id'],
            'anh_dai_dien' => $path,
        ]);

        return response()->json([
            'message' => 'Tạo người dùng thành công!',
            'data' => $user,
        ], 201);
    }

    // Xem chi tiết người dùng
    public function show($id)
    {
        $user = User::with('vaiTro')->findOrFail($id);

        return response()->json([
            'id' => $user->id,
            'ten' => $user->ten,
            'email' => $user->email,
            'so_dien_thoai' => $user->so_dien_thoai,
            'trang_thai' => $user->trang_thai,
            'vai_tro' => $user->vaiTro ? $user->vaiTro->ten_vai_tro : null,
            'anh_dai_dien' => $user->anh_dai_dien
                ? asset('storage/' . $user->anh_dai_dien)
                : null,
            'created_at' => $user->created_at,
        ]);
    }

    // Cập nhật người dùng
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'ten' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:nguoi_dung,email,' . $user->id,
            'so_dien_thoai' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:6',
            'trang_thai' => 'nullable|in:online,offline',
            'vai_tro_id' => 'nullable|integer|exists:vai_tro,id',
            'anh_dai_dien' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',
        ]);

        if ($request->filled('ten')) $user->ten = $request->ten;
        if ($request->filled('email')) $user->email = $request->email;
        if ($request->filled('so_dien_thoai')) $user->so_dien_thoai = $request->so_dien_thoai;
        if ($request->filled('trang_thai')) $user->trang_thai = $request->trang_thai;
        if ($request->filled('vai_tro_id')) $user->vai_tro_id = $request->vai_tro_id;
        if ($request->filled('password')) $user->password = Hash::make($request->password);
        // Nếu user hiện tại là khách hàng thì không được thay đổi vai trò
        if ($user->vaiTro && strtolower($user->vaiTro->ten_vai_tro) !== 'client') {
            if ($request->filled('vai_tro_id')) {
                $user->vai_tro_id = $request->vai_tro_id;
            }
        }


        // Cập nhật password mới nếu có
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }
        if ($request->hasFile('anh_dai_dien')) {
            if ($user->anh_dai_dien && Storage::disk('public')->exists($user->anh_dai_dien)) {
                Storage::disk('public')->delete($user->anh_dai_dien);
            }
            $user->anh_dai_dien = $request->file('anh_dai_dien')->store('uploads/avatar', 'public');
        }

        $user->save();
        $user->load('vaiTro');

        return response()->json([
            'message' => 'Cập nhật người dùng thành công!',
            'data' => [
                'id' => $user->id,
                'ten' => $user->ten,
                'email' => $user->email,
                'so_dien_thoai' => $user->so_dien_thoai,
                'trang_thai' => $user->trang_thai,
                'vai_tro' => $user->vaiTro ? $user->vaiTro->ten_vai_tro : null,
                'anh_dai_dien' => $user->anh_dai_dien ? asset('storage/' . $user->anh_dai_dien) : null,
            ],
        ]);
    }



    // Xóa người dùng
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->anh_dai_dien && Storage::disk('public')->exists($user->anh_dai_dien)) {
            Storage::disk('public')->delete($user->anh_dai_dien);
        }

        $user->delete();

        return response()->json(['message' => 'Xóa người dùng thành công!']);
    }
}
