<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\VerifyEmailUser;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class DangKyController extends Controller
{
    /**
     * Đăng ký tài khoản + gửi email xác thực
     */
    public function dangKy(Request $request)
    {
        // 1. Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'ten'            => 'required|string|max:255',
            'email'          => 'required|email|unique:nguoi_dung,email',
            'so_dien_thoai'  => 'required|regex:/^0[0-9]{9}$/|unique:nguoi_dung,so_dien_thoai',
            'password'       => 'required|min:6|confirmed',
            'anh_dai_dien'   => 'nullable|string',
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

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Dữ liệu không hợp lệ!',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // 2. Tạo mã xác thực (6 số)
        $verificationCode = random_int(100000, 999999);

        // 3. Lưu user
        $user = User::create([
            'ten'              => $request->ten,
            'email'            => $request->email,
            'so_dien_thoai'    => $request->so_dien_thoai,
            'password'         => Hash::make($request->password),
            'anh_dai_dien'     => $request->anh_dai_dien ?? null,
            'trang_thai'       => 1,
            'vai_tro_id'       => 3,
            'verification_code'=> $verificationCode,
            // 'email_verified_at' => null, // để mặc định null
        ]);

        // 4. Tạo link xác thực (nếu user bấm link)
        // Bạn có thể đổi sang FE: http://localhost:3000/verify-email?...
        $verifyUrl = url('/api/xac-thuc-email?email=' . urlencode($user->email) . '&code=' . $verificationCode);

        // 5. Gửi email – nếu lỗi thì trả luôn lỗi ra để bạn biết
        try {
            Mail::to($user->email)->send(new VerifyEmailUser($user, $verifyUrl, $verificationCode));
        } catch (\Throwable $th) {
            // Nếu SMTP sai, view sai, hoặc Gmail chặn → bạn sẽ thấy lỗi ở đây
            return response()->json([
                'status'  => false,
                'message' => 'Gửi email thất bại: ' . $th->getMessage(),
            ], 500);
        }

        // 6. Trả về JSON thành công
        return response()->json([
            'status'  => true,
            'message' => 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực.',
            'data'    => [
                'id'    => $user->id,
                'email' => $user->email,
            ]
        ], 201);
    }

    /**
     * Xác thực email bằng code (POST) hoặc link GET
     */
    public function xacThucEmail(Request $request)
    {
        // nếu GET: lấy từ query, nếu POST: lấy từ body
        $email = $request->input('email', $request->query('email'));
        $code  = $request->input('code', $request->query('code'));

        if (!$email || !$code) {
            return response()->json([
                'status' => false,
                'message' => 'Thiếu email hoặc mã xác thực.',
            ], 400);
        }

        $user = User::where('email', $email)
            ->where('verification_code', $code)
            ->first();

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Mã xác thực hoặc email không đúng.',
            ], 404);
        }

        // Nếu đã xác thực rồi
        if ($user->email_verified_at) {
            return response()->json([
                'status' => true,
                'message' => 'Email đã được xác thực trước đó.',
            ]);
        }

        $user->email_verified_at = now();
        $user->verification_code = null;
        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Xác thực email thành công!',
        ]);
    }

    /**
     * Gửi lại mã xác thực
     */
    public function guiLaiMa(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:nguoi_dung,email',
        ], [
            'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Email không hợp lệ.',
            'email.exists' => 'Email này chưa được đăng ký.',
        ]);

        $user = User::where('email', $request->email)->first();

        // Nếu đã xác thực thì không cần gửi lại
        if ($user->email_verified_at) {
            return response()->json([
                'status' => true,
                'message' => 'Email này đã được xác thực rồi.',
            ]);
        }

        // Tạo mã mới
        $verificationCode = random_int(100000, 999999);
        $user->verification_code = $verificationCode;
        $user->save();

        $verifyUrl = url('/api/xac-thuc-email?email=' . urlencode($user->email) . '&code=' . $verificationCode);

        try {
            Mail::to($user->email)->send(new VerifyEmailUser($user, $verifyUrl, $verificationCode));
        } catch (\Throwable $th) {
            return response()->json([
                'status'  => false,
                'message' => 'Gửi email thất bại: ' . $th->getMessage(),
            ], 500);
        }

        return response()->json([
            'status' => true,
            'message' => 'Đã gửi lại mã xác thực. Vui lòng kiểm tra email.',
        ]);
    }
}
