<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    // GET /api/menus : danh sách phẳng
    public function index(Request $request)
    {
        $q = Menu::query();

        if ($request->filled('active')) {
            $q->where('trang_thai', (int) $request->boolean('active'));
        }

        $items = $q->orderByRaw('COALESCE(stt, 999999)')
                   ->orderBy('ten_chuc_nang')
                   ->get();

        return response()->json($items);
    }

    // GET /api/menus/tree : trả về cây theo ma_chuc_nang/ma_cha
    public function tree()
    {
        $rows = Menu::orderByRaw('COALESCE(stt, 999999)')
                    ->orderBy('ten_chuc_nang')
                    ->get()
                    ->toArray();

        $byCode = [];
        foreach ($rows as $r) {
            $r['children'] = [];
            $byCode[$r['ma_chuc_nang']] = $r;
        }

        $roots = [];
        foreach ($byCode as $code => $item) {
            $p = $item['ma_cha'];
            if ($p && isset($byCode[$p])) {
                $byCode[$p]['children'][] = &$byCode[$code];
            } else {
                $roots[] = &$byCode[$code];
            }
        }

        return response()->json(array_values($roots));
    }

    // POST /api/menus : tạo mới
    public function store(Request $request)
    {
        $data = $request->validate([
            'ma_chuc_nang'  => 'required|string|max:20|unique:menu,ma_chuc_nang',
            'ma_cha'        => 'nullable|string|max:20|exists:menu,ma_chuc_nang|different:ma_chuc_nang',
            'ten_chuc_nang' => 'required|string|max:200',
            'state'         => 'nullable|string|max:100',
            'stt'           => 'nullable|integer|min:0',
            'trang_thai'    => 'nullable|in:0,1',
        ]);

        $menu = Menu::create($data);
        return response()->json($menu, 201);
    }

    // GET /api/menus/{menu}
    public function show(Menu $menu)
    {
        return response()->json($menu);
    }

    // PUT/PATCH /api/menus/{menu}
    public function update(Request $request, Menu $menu)
    {
        $data = $request->validate([
            'ma_chuc_nang'  => 'sometimes|required|string|max:20|unique:menu,ma_chuc_nang,' . $menu->id,
            'ma_cha'        => 'nullable|string|max:20|exists:menu,ma_chuc_nang|different:ma_chuc_nang',
            'ten_chuc_nang' => 'sometimes|required|string|max:200',
            'state'         => 'nullable|string|max:100',
            'stt'           => 'nullable|integer|min:0',
            'trang_thai'    => 'nullable|in:0,1',
        ]);

        $menu->update($data);
        return response()->json($menu);
    }

    // DELETE /api/menus/{menu}
    public function destroy(Menu $menu)
    {
        $menu->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
