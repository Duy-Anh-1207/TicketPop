<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // Lấy danh sách người dùng
    public function index()
    {
        $users = User::with('vaiTro')->get();

        $data = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'ten' => $user->ten,
                'email' => $user->email,
                'password' => $user->password,
                'trang_thai' => (int) $user->trang_thai,
                'vai_tro_id' => $user->vai_tro_id,
                'so_dien_thoai' => $user->so_dien_thoai,
                'anh_dai_dien' => $user->anh_dai_dien,
            ];
        });

        return response()->json($data);
    }

    // Thêm người dùng mới
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ten' => 'required|string|max:255',
            'email' => 'required|email|unique:nguoi_dung,email',
            'so_dien_thoai' => 'nullable|string|max:20',
            'password' => 'required|string|min:6',
            'anh_dai_dien' => 'nullable|string|max:255',
            'trang_thai' => 'nullable|in:0,1',
            'vai_tro_id' => 'required|integer|exists:vai_tro,id',
        ]);

        $user = User::create([
            'ten' => $validated['ten'],
            'email' => $validated['email'],
            'so_dien_thoai' => $validated['so_dien_thoai'] ?? null,
            'password' => Hash::make($validated['password']),
            'anh_dai_dien' => $validated['anh_dai_dien'] ?? null,
            'trang_thai' => $validated['trang_thai'] ?? 0,
            'vai_tro_id' => $validated['vai_tro_id'],
            'email_verified_at' => now(), 
        ]);

        return response()->json(['message' => 'Tạo người dùng thành công!', 'data' => $user], 201);
    }

    // Xem chi tiết
    public function show($id)
    {
        $user = User::with('vaiTro')->findOrFail($id);

        return response()->json([
            'id' => $user->id,
            'ten' => $user->ten,
            'email' => $user->email,
            'trang_thai' => (int) $user->trang_thai,
            'vai_tro_id' => $user->vai_tro_id,
            'so_dien_thoai' => $user->so_dien_thoai,
            'anh_dai_dien' => $user->anh_dai_dien,
        ]);
    }

    // Cập nhật
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // 1. Validate tất cả các trường. 'current_password' LÀ BẮT BUỘC.
        $validated = $request->validate([
            'ten' => 'sometimes|required|string|max:255', // 'sometimes' = chỉ validate nếu trường đó được gửi lên
            'email' => 'sometimes|required|email|unique:nguoi_dung,email,' . $user->id,
            'so_dien_thoai' => 'nullable|string|max:20',
            
            'current_password' => 'required|string|min:6', // <-- THAY ĐỔI: Luôn YÊU CẦU mật khẩu hiện tại
            'password' => 'nullable|string|min:6|confirmed', // Mật khẩu mới (có thể null)
        ]);

        // 2. KIỂM TRA MẬT KHẨU HIỆN TẠI ĐẦU TIÊN
        //    (Dùng $request->input thay vì $validated vì $validated['current_password'] có thể ko tồn tại nếu fail validation)
        if (!Hash::check($request->input('current_password'), $user->password)) {
            return response()->json([
                'message' => 'Mật khẩu hiện tại không đúng!',
                'errors' => [
                    'current_password' => ['Mật khẩu hiện tại không đúng!']
                ]
            ], 422); // 422 Unprocessable Entity
        }

        // 3. Mật khẩu đúng -> Lấy các trường cần update (trừ các trường PW)
        //    Sử dụng $request->only để chỉ lấy những gì FE gửi (ngoài PW)
        $updateData = $request->only('ten', 'email', 'so_dien_thoai');

        // 4. Cập nhật thông tin cơ bản (nếu có)
        if (!empty($updateData)) {
            $user->update($updateData);
        }

        // 5. Cập nhật mật khẩu mới (nếu FE có gửi 'password')
        if ($request->filled('password')) {
            $user->password = Hash::make($validated['password']);
            $user->save();
        }

        // 6. Trả về response thành công
        return response()->json([
            'message' => 'Cập nhật thông tin thành công!',
            'user' => $user->fresh() // .fresh() để lấy dữ liệu mới nhất
        ], 200);
    }

    // Xóa
    public function destroy($id)
    {
        User::destroy($id);
        return response()->json(['message' => 'Đã xóa người dùng']);
    }

    // ✅ BẬT / TẮT trạng thái người dùng
    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);
        $user->trang_thai = $user->trang_thai ? 0 : 1;
        $user->save();

        return response()->json([
            'message' => 'Trạng thái người dùng đã được thay đổi',
            'trang_thai' => $user->trang_thai,
        ]);
    }

    // ✅ Gán vai trò cho người dùng
    public function assignRole(Request $request, $id)
    {
        $validated = $request->validate([
            'vai_tro_id' => 'required|integer|exists:vai_tro,id'
        ]);

        $user = User::findOrFail($id);
        $user->vai_tro_id = $validated['vai_tro_id'];
        $user->save();

        return response()->json([
            'message' => 'Gán vai trò thành công',
            'vai_tro_id' => $user->vai_tro_id
        ]);
    }


    // ✅ Reset mật khẩu người dùng
    public function resetPassword($id)
    {
        $user = User::findOrFail($id);
        $newPassword = '123456'; // hoặc random nếu muốn

        $user->password = Hash::make($newPassword);
        $user->save();

        return response()->json([
            'message' => 'Mật khẩu đã được đặt lại',
            'new_password' => $newPassword, // chỉ nên hiển thị tạm cho admin
        ]);
    }
}