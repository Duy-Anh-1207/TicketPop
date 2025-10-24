<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DangNhapController extends Controller
{
    public function dangNhap(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6'
        ], [
            'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Email không hợp lệ.',
            'password.required' => 'Vui lòng nhập mật khẩu.',
            'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự.'
        ]);

        $user = User::where('email', $request->email)->first();

        // ❌ Sai tài khoản hoặc mật khẩu
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Email hoặc mật khẩu không đúng!'
            ], 401);
        }

        // 🚫 Kiểm tra tài khoản bị khóa
        if ($user->trang_thai == 0) {
            return response()->json([
                'status' => false,
                'message' => 'Tài khoản của bạn đã bị khóa!'
            ], 403);
        }

        // ✅ Phân quyền và chuyển hướng
        $vaiTro = $user->vaiTro->ten_vai_tro ?? 'Khách hàng';
        $redirectUrl = ($vaiTro === 'Admin') ? '/admin/phim' : '/';

        return response()->json([
            'status' => true,
            'message' => 'Đăng nhập thành công!',
            'data' => [
                'id' => $user->id,
                'ten' => $user->ten,
                'email' => $user->email,
                'vai_tro' => $vaiTro,
                'redirect_url' => $redirectUrl,
            ]
        ]);
    }

    public function dangXuat(Request $request)
    {
        return response()->json([
            'status' => true,
            'message' => 'Đăng xuất thành công!'
        ]);
    }
}
