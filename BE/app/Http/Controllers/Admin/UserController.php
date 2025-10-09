<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\VaiTro;
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
                'password' => $user->password,
                'trang_thai' => $user->trang_thai,
                'vai_tro_id' => $user->vai_tro_id,
                'so_dien_thoai' => $user->so_dien_thoai,
                'anh_dai_dien' => $user->anh_dai_dien,

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
            'anh_dai_dien' => 'nullable|string|max:255',
           'trang_thai' => 'nullable|in:online,offline',
            'vai_tro_id' => 'required|integer|exists:vai_tro,id',
        ]);

        $user = User::create([
            'ten' => $validated['ten'],
            'email' => $validated['email'],
            'so_dien_thoai' => $validated['so_dien_thoai'] ?? null,
            'password' => Hash::make($validated['password']),
            'anh_dai_dien' => $validated['anh_dai_dien'] ?? null,
            'trang_thai' => $request->trang_thai ?? 'offline',
            'vai_tro_id' => $validated['vai_tro_id'],
        ]);

       return response()->json(['message' => 'Tạo người dùng thành công!', 'data' => $user], 201);
    }

    // Xem chi tiết người dùng
    public function show($id)
    {
        $user = User::with('vaiTro')->findOrFail($id);

        return response()->json([
            'id' => $user->id,
            'ten' => $user->ten,
            'email' => $user->email,
            'trang_thai' => $user->trang_thai,
            'vai_tro_id' => $user->vai_tro_id,
            'so_dien_thoai' => $user->so_dien_thoai,
            'anh_dai_dien' => $user->anh_dai_dien,
            
        ]);
    }

    // Cập nhật người dùng
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'ten' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:nguoi_dung,email,' . $user->id,
            'so_dien_thoai' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:6',
            'anh_dai_dien' => 'nullable|string|max:255',
            'trang_thai' => 'nullable|in:online,offline', // ✅ vì DB là tinyint(1)
            'vai_tro_id' => 'sometimes|required|integer|exists:vai_tro,id',
        ]);

        $user->update(array_filter($validated, fn($key) => $key !== 'password', ARRAY_FILTER_USE_KEY));

        if ($request->filled('password')) {
            $user->password = Hash::make($validated['password']);
            $user->save();
        }

        $user->load('vaiTro');

        return response()->json([
            'message' => 'Người dùng đã được cập nhật',
            'user' => [
                'id' => $user->id,
                'ten' => $user->ten,
                'email' => $user->email,
                'so_dien_thoai' => $user->so_dien_thoai,
                'trang_thai' => $user->trang_thai,
                'vai_tro_id' => $user->vai_tro_id,
                'anh_dai_dien' => $user->anh_dai_dien,
            ]
        ]);
    }


    // Xóa người dùng
    public function destroy($id)
    {
        User::destroy($id);
        return response()->json(['message' => 'Đã xóa người dùng']);
    }
}
