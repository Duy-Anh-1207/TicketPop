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
        // 1. Validate đầu vào
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6'
        ], [
            'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Email không hợp lệ.',
            'password.required' => 'Vui lòng nhập mật khẩu.',
            'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự.'
        ]);

        // 2. Tìm user theo email
        $user = User::where('email', $request->email)->first();

        // 3. Sai email hoặc mật khẩu
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Email hoặc mật khẩu không đúng!'
            ], 401);
        }

        // 4. Tài khoản bị khóa
        if ($user->trang_thai == 0) {
            return response()->json([
                'status' => false,
                'message' => 'Tài khoản của bạn đã bị khóa!'
            ], 403);
        }

        // 5. CHẶN CHƯA XÁC THỰC EMAIL
        // kiểm tra theo đúng flow bạn vừa làm: bảng nguoi_dung có cột email_verified_at
        if (is_null($user->email_verified_at)) {
            return response()->json([
                'status' => false,
                'message' => 'Email của bạn chưa được xác thực. Vui lòng kiểm tra email để xác thực hoặc yêu cầu gửi lại mã.'
            ], 403);
        }

        // 6. Tạo token Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        // 7. Lấy vai trò để điều hướng
        $vaiTro = $user->vaiTro->ten_vai_tro ?? 'Khách hàng';
        $redirectUrl = ($vaiTro === 'Admin') ? '/admin' : '/';

        // 8. Trả về JSON
        return response()->json([
            'status' => true,
            'message' => 'Đăng nhập thành công!',
            'data' => [
                'id'         => $user->id,
                'ten'        => $user->ten,
                'email'      => $user->email,
                'vai_tro'    => $vaiTro,
                'token'      => $token,
                'redirect_url' => $redirectUrl,
            ]
        ]);
    }

    public function dangXuat(Request $request)
    {
        // Xóa token hiện tại
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Đăng xuất thành công!'
        ]);
    }
}
