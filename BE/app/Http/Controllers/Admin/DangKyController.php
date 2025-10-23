<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class DangKyController extends Controller
{
    public function dangKy(Request $request)
    {
        // 1️⃣ Kiểm tra dữ liệu đầu vào
        $kiemTra = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6|confirmed',
        ], [
            'name.required' => 'Vui lòng nhập tên.',
            'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Email không hợp lệ.',
            'email.unique' => 'Email đã tồn tại.',
            'password.required' => 'Vui lòng nhập mật khẩu.',
            'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự.',
            'password.confirmed' => 'Mật khẩu xác nhận không khớp.',
        ]);

        if ($kiemTra->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu không hợp lệ!',
                'errors' => $kiemTra->errors(),
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
            'is_active' => true,
        ]);

        // 3️⃣ Trả phản hồi
        return response()->json([
            'status' => true,
            'message' => 'Đăng ký tài khoản thành công!',
            'data' => $user,
        ], 201);
    }
}
