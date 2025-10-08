<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\VaiTro;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function index()
    {
          $users = User::with('vaiTro')->get();

    $data = $users->map(function ($user) {
        return [
            'id' => $user->id,
            'ten' => $user->ten,
            'email' => $user->email,
            'trang_thai' => $user->trang_thai,
            'vai_tro_id' => $user->vai_tro_id,
            'so_dien_thoai' => $user->so_dien_thoai,
            'anh_dai_dien' => $user->anh_dai_dien
        ];
    });

    return response()->json($data);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ten' => 'required|string|max:255',
            'email' => 'required|email|unique:nguoi_dung,email',
            'so_dien_thoai' => 'nullable|string|max:20',
            'password' => 'required|string|min:6',
            'anh_dai_dien' => 'nullable|string|max:255',
            'trang_thai' => 'nullable|string|in:active,inactive',
            'vai_tro_id' => 'required|integer|exists:vai_tro.id',
        ]);

        $user = User::create([
            'ten' => $validated['ten'],
            'email' => $validated['email'],
            'so_dien_thoai' => $validated['so_dien_thoai'] ?? null,
            'password' => Hash::make($validated['password']),
            'anh_dai_dien' => $validated['anh_dai_dien'] ?? null,
            'trang_thai' => $validated['trang_thai'] ?? 'active',
            'vai_tro_id' => $validated['vai_tro_id'],
        ]);

        return response()->json($user, 201);
    }

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
        'anh_dai_dien' => $user->anh_dai_dien
    ]);
    }

    public function update(Request $request, $id)
{
    $user = User::findOrFail($id);

    $validated = $request->validate([
        'ten' => 'sometimes|required|string|max:255',
        'email' => 'sometimes|required|email|unique:nguoi_dung,email,' . $user->id,
        'so_dien_thoai' => 'nullable|string|max:20',
        'password' => 'nullable|string|min:6',
        'anh_dai_dien' => 'nullable|string|max:255',
        'trang_thai' => 'nullable|string|in:active,inactive',
        'vai_tro_id' => 'sometimes|required|integer|exists:vai_tros,id',
    ]);

    // Cập nhật các trường trừ password
    $user->update(array_filter($validated, fn($key) => $key !== 'password', ARRAY_FILTER_USE_KEY));

    // Cập nhật password nếu có
    if ($request->filled('password')) {
        $user->password = Hash::make($validated['password']);
        $user->save();
    }

    // Load tên vai trò nếu có
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
            'vai_tro_ten' => $user->vaiTro->ten ?? null,
            'anh_dai_dien' => $user->anh_dai_dien
        ]
    ]);
}


    public function destroy($id)
    {
        User::destroy($id);
        return response()->json(['message' => 'Đã xóa người dùng']);
    }
    
//     public function updateStatus(Request $request, $id)
// {
//     $validated = $request->validate([
//         'trang_thai' => 'required|string|in:active,inactive'
//     ]);

//     $user = User::findOrFail($id);
//     $user->trang_thai = $validated['trang_thai'];
//     $user->save();

//     return response()->json([
//         'message' => 'Trạng thái đã được cập nhật',
//         'trang_thai_moi' => $user->trang_thai
//     ]);
// }

// public function updateRole(Request $request, $id)
// {
//     $validated = $request->validate([
//         'vai_tro_id' => 'required|integer|exists:vai_tro.id'
//     ]);

//     $user = User::findOrFail($id);
//     $user->vai_tro_id = $validated['vai_tro_id'];
//     $user->save();

//     return response()->json([
//         'message' => 'Vai trò đã được cập nhật',
//         'vai_tro_moi' => $user->vai_tro_id
//     ]);
// }


}
