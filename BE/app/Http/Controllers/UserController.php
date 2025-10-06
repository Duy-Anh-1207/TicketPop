<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
class UserController extends Controller
{
    // Lấy tất cả người dùng
    public function index()
    {
        return response()->json(User::all());
    }

    // Tạo người dùng mới
    public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users',
        'password' => 'required|string|min:6',
        'email_verified_at' => now(),
    ]);

    $validated['password'] = Hash::make($validated['password']);
    $user = User::create($validated);

    return response()->json([
        'message' => 'User created successfully',
        'data' => $user
    ], 201);
}

    // Hiển thị 1 người dùng theo ID
    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    // Cập nhật thông tin người dùng
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:6',
            'email_verified_at' => now(),
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'data' => $user,
        ]);
    }

    // Xóa người dùng
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
    public function toggleStatus($id)
{
    $user = User::findOrFail($id);

    // Kiểm tra cột is_active có tồn tại không
    if (! Schema::hasColumn('users', 'is_active')) {
        return response()->json([
            'message' => "Column 'is_active' does not exist on users table. Please add it or modify the API to use the correct column."
        ], 400);
    }

    $user->is_active = ! (bool) $user->is_active;
    $user->save();

    return response()->json([
        'message' => $user->is_active ? 'Tài khoản đã được mở khóa' : 'Tài khoản đã bị khóa',
        'user' => $user
    ]);
}
public function assignRole(Request $request, $id)
{
    $user = User::find($id);
    if (! $user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    $validated = $request->validate([
        'role' => 'required|string'
    ]);

    $user->role = $validated['role'];
    $user->save();

    return response()->json([
        'message' => 'Role assigned successfully',
        'data' => $user
    ]);
}
public function resetPassword(Request $request, $id)
{
    $user = User::find($id);
    if (! $user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    $validated = $request->validate([
        'password' => 'required|string|min:6'
    ]);

    $user->password = Hash::make($validated['password']);
    $user->save();

    return response()->json([
        'message' => 'Password reset successfully',
        'data' => $user
    ]);
}


}
