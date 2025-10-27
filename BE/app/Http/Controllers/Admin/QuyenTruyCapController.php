<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QuyenTruyCap;
use Illuminate\Http\Request;

class QuyenTruyCapController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = QuyenTruyCap::all();
        return response()->json([
            'data' => $data,
            'message' => 'Lấy danh sách quyền truy cập thành công'
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->all();
        foreach ($data as $item) {
            foreach ($data as $item) {
                QuyenTruyCap::updateOrInsert(
                    [
                        'vai_tro_id' => $item['vai_tro_id'],
                        'menu_id' => $item['menu_id'],
                    ],
                    [
                        'function' => is_array($item['function'])
                            ? implode(',', $item['function'])
                            : $item['function'],
                        'updated_at' => now(),
                    ]
                );
            }
        }

        return response()->json(['message' => 'Cập nhật quyền truy cập thành công'], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
