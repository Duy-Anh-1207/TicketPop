<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DangNhapController extends Controller
{
    // Quy ước role id (đi đúng seed DB của bạn)
    private const ROLE_ADMIN = 1;
    private const ROLE_STAFF = 2;
    private const ROLE_CUSTOMER = 3;

    public function dangNhap(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|min:6',
        ]);

        $user = User::where('email', $request->email)->first();

        // Email/mật khẩu sai
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status'  => false,
                'message' => 'Email hoặc mật khẩu không đúng!',
            ], 401);
        }

        // Bị khóa
        if ((int)$user->trang_thai === 0) {
            return response()->json([
                'status'  => false,
                'message' => 'Tài khoản của bạn đã bị khóa!',
            ], 403);
        }

        // Chưa xác thực email
        if (is_null($user->email_verified_at)) {
            return response()->json([
                'status'  => false,
                'message' => 'Email của bạn chưa được xác thực. Vui lòng kiểm tra email để xác thực hoặc yêu cầu gửi lại mã.',
            ], 403);
        }

        // Tạo token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Thông tin vai trò
        $roleId   = (int)$user->vai_tro_id;
        $roleName = $user->vaiTro->ten_vai_tro ?? 'Khách hàng';

        // Quyền truy cập (menu + chức năng)
        $permissions = $user->quyenTruyCap()->get()->map(function ($item) {
            return [
                'menu_id'    => (int)$item->menu_id,
                'chuc_nang'  => is_array($item->function)
                    ? $item->function
                    : array_values(array_filter(array_map('trim', explode(',', (string)$item->function)))),
            ];
        });

        // Chỉ cho phép admin luôn vào admin, nhân viên phải có ít nhất một quyền
        $canAccessAdmin = false;
        if ($roleId === self::ROLE_ADMIN) {
            $canAccessAdmin = true;
        } elseif ($roleId === self::ROLE_STAFF) {
            $canAccessAdmin = $permissions->count() > 0;
        }

        // Điều hướng mặc định
        $redirectUrl = $canAccessAdmin ? '/admin' : '/';

        return response()->json([
            'status'  => true,
            'message' => 'Đăng nhập thành công!',
            'data'    => [
                'id'                => (int)$user->id,
                'ten'               => $user->ten,
                'email'             => $user->email,
                'so_dien_thoai'     => $user->so_dien_thoai,
                'vai_tro'           => $roleName,
                'vai_tro_id'        => $roleId,          // FE dùng id để guard
                'can_access_admin'  => $canAccessAdmin,  // FE điều hướng & guard
                'token'             => $token,
                'redirect_url'      => $redirectUrl,
                'permissions'       => $permissions,
            ],
        ]);
    }

    public function dangXuat(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Đăng xuất thành công!',
        ]);
    }
}
