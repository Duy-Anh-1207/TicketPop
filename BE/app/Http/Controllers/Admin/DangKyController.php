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
        $kiemTra = Validator::make($request->all(), [
            'ten' => 'required|string|max:255',
            'email' => 'required|email|unique:nguoi_dung,email',
            'so_dien_thoai' => 'required|regex:/^0[0-9]{9}$/|unique:nguoi_dung,so_dien_thoai',
            'password' => 'required|min:6|confirmed',
            'anh_dai_dien' => 'nullable|string'
        ], [
            'ten.required' => 'Vui lòng nhập tên.',
            'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Email không hợp lệ.',
            'email.unique' => 'Email đã tồn tại.',
            'so_dien_thoai.required' => 'Vui lòng nhập số điện thoại.',
            'so_dien_thoai.regex' => 'Số điện thoại không đúng định dạng (bắt đầu bằng 0, gồm 10 số).',
            'so_dien_thoai.unique' => 'Số điện thoại này đã được sử dụng.',
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
            'ten' => $request->ten,
            'email' => $request->email,
            'so_dien_thoai' => $request->so_dien_thoai,
            'password' => Hash::make($request->password),
            'anh_dai_dien' => $request->anh_dai_dien ?? null,
            'trang_thai' => 1,
            'vai_tro_id' => 3,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Đăng ký tài khoản thành công!',
            'data' => [
                'id' => $user->id,
                'ten' => $user->ten,
                'email' => $user->email,
                'so_dien_thoai' => $user->so_dien_thoai,
                'anh_dai_dien' => $user->anh_dai_dien,
                'vai_tro' => $user->vaiTro->ten_vai_tro ?? 'Khách hàng'
            ]
        ], 201);
    }
}
