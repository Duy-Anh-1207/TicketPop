<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\ResetPasswordRequestMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class QuenMatKhauController extends Controller
{
    // Gửi yêu cầu quên mật khẩu (gửi email chứa token)
    public function guiYeuCau(Request $request)
    {
        // Require both email and phone for added verification
        $request->validate([
            'email' => 'required|email|exists:nguoi_dung,email',
            'so_dien_thoai' => 'required|string',
        ]);

        $email = $request->email;
        $phone = $request->so_dien_thoai;

        $user = User::where('email', $email)->where('so_dien_thoai', $phone)->first();
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Email hoặc số điện thoại không khớp với hồ sơ.'], 404);
        }

        // Remove previous codes for this email
        DB::table('dat_lai_mat_khau')->where('email', $email)->delete();

        // Generate 6-digit numeric code
        $code = (string) random_int(100000, 999999);

        DB::table('dat_lai_mat_khau')->insert([
            'email' => $email,
            'token' => $code, // store code in token column
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        try {
            Mail::to($email)->send(new ResetPasswordRequestMail($user, $code));
        } catch (\Throwable $th) {
            return response()->json(['status' => false, 'message' => 'Gửi email thất bại: ' . $th->getMessage()], 500);
        }

        return response()->json(['status' => true, 'message' => 'Mã đặt lại mật khẩu đã được gửi tới email. Vui lòng kiểm tra hộp thư.']);
    }

    // Thực hiện đặt lại mật khẩu bằng token
    public function datLaiMatKhau(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:nguoi_dung,email',
            'code' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $record = DB::table('dat_lai_mat_khau')
            ->where('email', $request->email)
            ->where('token', $request->code)
            ->first();

        if (!$record) {
            return response()->json(['status' => false, 'message' => 'Mã hoặc email không hợp lệ.'], 400);
        }

        // Check code not older than 60 minutes
        $created = Carbon::parse($record->created_at);
        if ($created->diffInMinutes(now()) > 60) {
            DB::table('dat_lai_mat_khau')->where('email', $request->email)->delete();
            return response()->json(['status' => false, 'message' => 'Mã đã hết hạn. Vui lòng yêu cầu lại.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('dat_lai_mat_khau')->where('email', $request->email)->delete();

        return response()->json(['status' => true, 'message' => 'Mật khẩu đã được đặt lại thành công.']);
    }
}
