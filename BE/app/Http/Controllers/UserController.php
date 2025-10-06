<?php 
// app/Http/Controllers/UserController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
class UserController extends Controller{

public function index(Request $request)
{
    $query = User::query();

    // Tìm kiếm theo tên hoặc email
    if ($request->has('search')) {
        $query->where('name', 'like', '%' . $request->search . '%')
              ->orWhere('email', 'like', '%' . $request->search . '%');
    }

    // Lọc theo vai trò
    if ($request->has('role')) {
        $query->where('role', $request->role);
    }

    return response()->json($query->paginate(10));
}
public function show($id)
{
    $user = User::findOrFail($id);
    return response()->json($user);
}
public function store(Request $request)
{
    $request->validate([
        'name' => 'required|string',
        'email' => 'required|email|unique:users',
        'password' => 'required|min:6',
        'role' => 'required|string'
    ]);

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => bcrypt($request->password),
        'role' => $request->role,
    ]);

    return response()->json($user, 201);
}
public function update(Request $request, $id)
{
    $user = User::findOrFail($id);

    $request->validate([
        'name' => 'sometimes|string',
        'email' => 'sometimes|email|unique:users,email,' . $id,
        'role' => 'sometimes|string'
    ]);

    $user->update($request->only(['name', 'email', 'role']));

    return response()->json($user);
}
public function toggleStatus($id)
{
    $user = User::findOrFail($id);
    $user->is_active = !$user->is_active;
    $user->save();

    return response()->json([
        'message' => $user->is_active ? 'Tài khoản đã được mở khóa' : 'Tài khoản đã bị khóa',
        'user' => $user
    ]);
}
public function assignRole(Request $request, $id)
{
    $request->validate([
        'role' => 'required|string'
    ]);

    $user = User::findOrFail($id);
    $user->role = $request->role;
    $user->save();

    return response()->json([
        'message' => 'Gán vai trò thành công',
        'user' => $user
    ]);
}
public function resetPassword($id)
{
    $user = User::findOrFail($id);
    $newPassword = '123456'; // hoặc random password

    $user->password = bcrypt($newPassword);
    $user->save();

    return response()->json([
        'message' => 'Mật khẩu đã được reset',
        'new_password' => $newPassword
    ]);
}


}
