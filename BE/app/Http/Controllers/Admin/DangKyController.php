<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class DangKyController extends Controller
{
    /**
     * Xử lý đăng ký tài khoản mới
     */
    public function dangKy(Request $request)
    {
        // ✅ 1. Kiểm tra dữ liệu đầu vào
        $kiemTra = Validator::make($request->all(), [
            'ten' => 'required|string|max:255',
            'email' => 'required|email|unique:nguoi_dung,email',
            'so_dien_thoai' => 'nullable|regex:/^0[0-9]{9}$/',
            'password' => 'required|min:6|confirmed',
        ], [
            'ten.required' => 'Vui lòng nhập tên.',
            'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Email không hợp lệ.',
            'email.unique' => 'Email đã tồn tại.',
            'so_dien_thoai.regex' => 'Số điện thoại không đúng định dạng.',
            'password.required' => 'Vui lòng nhập mật khẩu.',
            'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự.',
            'password.confirmed' => 'Mật khẩu xác nhận không khớp.',
        ]);

        if ($kiemTra->fails()) {
            return response()->json([
                'trang_thai' => false,
                'thong_bao' => 'Dữ liệu không hợp lệ!',
                'loi' => $kiemTra->errors(),
            ], 422);
        }

        // ✅ 2. Tạo người dùng mới
        $nguoiDung = User::create([
            'ten' => $request->ten,
            'email' => $request->email,
            'so_dien_thoai' => $request->so_dien_thoai,
            'password' => Hash::make($request->password),
            'anh_dai_dien' => $request->anh_dai_dien ?? null,
            'trang_thai' => 1,
            'vai_tro_id' => 3, 
        ]);

        // ✅ 3. Trả phản hồi JSON
        return response()->json([
            'trang_thai' => true,
            'thong_bao' => 'Đăng ký tài khoản thành công!',
            'du_lieu' => $nguoiDung,
        ], 201);
    }
}
