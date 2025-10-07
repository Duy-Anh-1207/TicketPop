<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    
    public function index()
    {
        return Room::all();
    }
    public function store(Request $request)
    {
        $data = $request->validate([
            'ten_phong' => 'required|string|max:255',
            'loai_so_do' => 'required|string|max:255',
            'hang_thuong' => 'required|integer|min:0',
            'hang_vip' => 'required|integer|min:0',
            'trang_thai' => 'required|string',
        ]);
        $room = Room::create($data);
        return response()->json([
            'message' => 'Thêm phòng chiếu thành công!',
            'data' => $room
        ], 201);
    }
    public function show(string $id)
    {
        $room = Room::find($id);
        if (!$room) {
            return response()->json([
              'message' => 'Không tìm thấy phòng chiếu!'  
            ],404);
        }
        return response()->json([
            'message' => 'Chi tiết phòng chiếu!',
            'data' => $room
        ],200);
    }
    public function update(Request $request, string $id)
    {
        $room = Room::find($id);
        if (!$room) {
            return response()->json([
                'messeage' => 'Không tìm thấy phòng chiếu nào!'
            ], 404);
        }
        $data = $request->validate([
            'ten_phong' => 'sometimes|required|string|max:255',
            'loai_so_do' => 'sometimes|required|string|max:255',
            'hang_thuong' => 'sometimes|required|integer|min:0',
            'hang_vip' => 'sometimes|required|integer|min:0',
            'trang_thai' => 'sometimes|required|string',
        ]);
        $room->update($data);
        return response()->json([
            'message' => 'Cập nhật phòng chiếu thành công!',
            'data' => $room
        ], 200);
    }
    public function destroy(string $id)
    {
        // $room = Room::find($id);
        // if (!$room) {
        //     return response()->json([
        //         'message' => 'Không tìm thấy phòng chiếu'
        //     ], 404);
        // }
        // $room->delete();
        // return response()->json([
        //     'message' => 'Xóa phòng chiếu thành công',
        //     'data' => $room
        // ], 200);
        $room = Room::find($id);
        if (!$room){
            return response()->json([
                'message' => 'Không tìm thấy phòng chiếu!'
            ],404);
        }
        $room->delete();
        return response()->json([
            'message' => 'Xóa phòng chiếu thành công!',
            'data' => $room
        ], 200);
    }
}
