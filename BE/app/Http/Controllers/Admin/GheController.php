<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ghe;
use Illuminate\Http\Request;

class GheController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $data = Ghe::where('phong_id', $id)->get();
        return response()->json([
            'status' => 200,
            'data' => $data
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'loai_ghe_id' => 'required|integer|in:1,2',
        ]);

        $ghe = Ghe::with('phongChieu')->findOrFail($id);

        // Kiểm tra trạng thái phòng chiếu
        if ($ghe->phongChieu->trang_thai !== 0) {
            return response()->json([
                'success' => false,
                'message' => 'Phòng chiếu không cho phép thay đổi ghế!'
            ], 403);
        }

        $ghe->loai_ghe_id = $request->loai_ghe_id;
        $ghe->save();

        return response()->json([
            'success' => true,
            'data' => $ghe
        ]);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
