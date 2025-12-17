<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LichChieu;
use App\Models\LoaiGhe;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoomController extends Controller
{

    public function index(Request $request)
    {
        // Lấy giá trị query param 'status' (vd: /room?status=1)
        $status = $request->query('status');

        // Nếu có truyền status thì lọc, ngược lại trả toàn bộ
        $query = Room::query();

        if (!is_null($status)) {
            $query->where('trang_thai', $status);
        }

        $rooms = $query->orderByDesc('id')->get();

        return response()->json([
            'message' => 'Danh sách phòng chiếu',
            'data' => $rooms
        ], 200);
    }
    public function store(Request $request)
    {
        $data = $request->validate([
            'ten_phong' => 'required|string|max:255',
            'loai_so_do' => ['required', 'regex:/^\d+x\d+$/'],
            'hang_thuong' => 'required|integer|min:0',
            'hang_vip' => 'required|integer|min:0',
            'trang_thai' => 'required|string',
        ], [
            'loai_so_do.regex' => 'Sơ đồ phải có dạng NxM, ví dụ: 8x8 hoặc 10x12.',
            'ten_phong.unique' => 'Tên phòng đã tồn tại.',
        ]);

        [$rows, $cols] = explode('x', $data['loai_so_do']);

        if ((int)$rows !== (int)$cols) {
            return response()->json([
                'message' => "Sơ đồ phòng chiếu phải là hình vuông (N x N), ví dụ: 8x8 hoặc 10x10.",
                'error' => "Giá trị hiện tại là {$data['loai_so_do']} (không phải hình vuông)"
            ], 422);
        }
        $tong_hang = (int)$rows;
        $tong_so_hang = $data['hang_thuong'] + $data['hang_vip'];
        if ($tong_hang !== $tong_so_hang) {
            return response()->json([
                'message' => "Số hàng không khớp với sơ đồ ({$data['loai_so_do']} = {$tong_hang} hàng)",
                'error' => "Tổng hàng thường ({$data['hang_thuong']}) + hàng VIP ({$data['hang_vip']}) phải = {$tong_hang}"
            ], 422);
        }

        $room = Room::create($data);

        $loaiThuong = LoaiGhe::firstOrCreate(['ten_loai_ghe' => 'Ghế Thường']);
        $loaiVIP = LoaiGhe::firstOrCreate(['ten_loai_ghe' => 'Ghế Vip']);

        $gheData = [];
        $alphabet = range('A', 'Z');
        $hangThuong = $data['hang_thuong'];

        for ($i = 0; $i < $rows; $i++) {
            $hang = $alphabet[$i];
            $loai_ghe_id = ($i < $hangThuong) ? $loaiThuong->id : $loaiVIP->id;

            for ($j = 1; $j <= $cols; $j++) {
                $gheData[] = [
                    'phong_id' => $room->id,
                    'loai_ghe_id' => $loai_ghe_id,
                    'so_ghe' => $hang . $j,
                    'hang' => $hang,
                    'cot' => $j,
                    'trang_thai' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        DB::table('ghe')->insert($gheData);

        return response()->json([
            'message' => 'Thêm phòng chiếu thành công!',
            'data' => $room,
            'tong_so_ghe' => count($gheData)
        ], 201);
    }

    public function show(string $id)
    {
        $room = Room::find($id);
        if (!$room) {
            return response()->json([
                'message' => 'Không tìm thấy phòng chiếu!'
            ], 404);
        }
        return response()->json([
            'message' => 'Chi tiết phòng chiếu!',
            'data' => $room
        ], 200);
    }
    public function update(Request $request, string $id)
    {
        $room = Room::find($id);
        if (!$room) {
            return response()->json([
                'message' => 'Không tìm thấy phòng chiếu nào!'
            ], 404);
        }

        $data = $request->validate([
            'ten_phong' => "sometimes|required|string|max:255",
            'loai_so_do' => ['sometimes', 'required', 'regex:/^\d+x\d+$/'],
            'hang_thuong' => 'sometimes|required|integer|min:0',
            'hang_vip' => 'sometimes|required|integer|min:0',
            'trang_thai' => 'sometimes|required|string',
        ], [
            'ten_phong.unique' => 'Tên phòng đã tồn tại, vui lòng chọn tên khác!',
            'loai_so_do.regex' => 'Sơ đồ phải có dạng NxM, ví dụ: 8x8 hoặc 10x12.',
        ]);
        $loaiSoDo = $data['loai_so_do'] ?? $room->loai_so_do;
        $hangThuong = $data['hang_thuong'] ?? $room->hang_thuong;
        $hangVip = $data['hang_vip'] ?? $room->hang_vip;
        [$rows, $cols] = explode('x', $loaiSoDo);

        if ((int)$rows !== (int)$cols) {
            return response()->json([
                'message' => "Sơ đồ phòng chiếu phải là hình vuông (N x N), ví dụ: 8x8 hoặc 10x10.",
                'error' => "Giá trị hiện tại là {$loaiSoDo} (không phải hình vuông)"
            ], 422);
        }

        $tong_hang = (int)$rows;
        $tong_so_hang = $hangThuong + $hangVip;
        if ($tong_hang !== $tong_so_hang) {
            return response()->json([
                'message' => "Số hàng không khớp với sơ đồ ({$loaiSoDo} = {$tong_hang} hàng)",
                'error' => "Tổng hàng thường ({$hangThuong}) + hàng VIP ({$hangVip}) phải = {$tong_hang}"
            ], 422);
        }
        $room->update($data);

        return response()->json([
            'message' => 'Cập nhật phòng chiếu thành công!',
            'data' => $room
        ], 200);
    }
    public function destroy(string $id)
    {
        $room = Room::find($id);
        if (!$room) {
            return response()->json([
                'message' => 'Không tìm thấy phòng chiếu!'
            ], 404);
        }
        $room->delete();
        return response()->json([
            'message' => 'Xóa phòng chiếu thành công!',
            'data' => $room
        ], 200);
    }
    public function changeStatus($id)
    {
        $room = Room::find($id);

        if (!$room) {
            return response()->json([
                'message' => 'Không tìm thấy phòng chiếu!'
            ], 404);
        }

        /**
         * 👉 Nếu phòng ĐANG HOẠT ĐỘNG (1)
         * và chuẩn bị chuyển sang BẢO TRÌ (0)
         * thì phải check lịch chiếu
         */
        if ($room->trang_thai == 1) {
            $coLichDangHoatDong = LichChieu::where('phong_id', $room->id)
                ->where('gio_ket_thuc', '>', Carbon::now())
                ->whereNull('deleted_at')
                ->exists();

            if ($coLichDangHoatDong) {
                return response()->json([
                    'message' => 'Không thể bảo trì vì phòng vẫn còn lịch chiếu đang hoạt động!'
                ], 400);
            }
        }

        // Toggle trạng thái
        $room->trang_thai = $room->trang_thai == 1 ? 0 : 1;
        $room->save();

        return response()->json([
            'message' => 'Cập nhật trạng thái phòng chiếu thành công!',
            'data' => [
                'id' => $room->id,
                'trang_thai_moi' => $room->trang_thai
            ]
        ], 200);
    }

}
