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

        // stt là string => ép số để sort chính xác
        $items = $q->orderByRaw("CASE WHEN stt IS NULL OR stt='' THEN 999999 ELSE CAST(stt AS UNSIGNED) END")
                   ->orderBy('ten_chuc_nang')
                   ->get();

        return response()->json($items);
    }

    // GET /api/menus/tree : trả về cây theo ma_chuc_nang/ma_cha
    public function tree(Request $request)
    {
        $q = Menu::query();

        if ($request->filled('active')) {
            $q->where('trang_thai', (int) $request->boolean('active'));
        }

        $rows = $q->orderByRaw("CASE WHEN stt IS NULL OR stt='' THEN 999999 ELSE CAST(stt AS UNSIGNED) END")
                  ->orderBy('ten_chuc_nang')
                  ->get()
                  ->toArray();

        // build map
        $map = [];
        foreach ($rows as $r) {
            $r['children'] = [];
            $map[$r['ma_chuc_nang']] = $r;
        }

        // gắn con vào cha
        $roots = [];
        foreach ($map as $code => $item) {
            $parent = $item['ma_cha'];
            if ($parent && isset($map[$parent])) {
                $map[$parent]['children'][] = $map[$code];
            } else {
                $roots[] = $map[$code];
            }
        }

        // sort children theo stt số + tên
        $sortFn = function (&$nodes) use (&$sortFn) {
            usort($nodes, function ($a, $b) {
                $aa = ($a['stt'] === null || $a['stt'] === '') ? 999999 : (int) $a['stt'];
                $bb = ($b['stt'] === null || $b['stt'] === '') ? 999999 : (int) $b['stt'];
                if ($aa === $bb) {
                    return strcmp($a['ten_chuc_nang'], $b['ten_chuc_nang']);
                }
                return $aa <=> $bb;
            });
            foreach ($nodes as &$n) {
                if (!empty($n['children'])) {
                    $sortFn($n['children']);
                }
            }
        };
        $sortFn($roots);

        return response()->json(array_values($roots));
    }

    // POST /api/menus : tạo mới
    public function store(Request $request)
    {
        $data = $request->validate([
            'ma_chuc_nang'  => 'required|string|max:250|unique:menu,ma_chuc_nang',
            'ma_cha'        => 'nullable|string|max:250|different:ma_chuc_nang|exists:menu,ma_chuc_nang',
            'ten_chuc_nang' => 'required|string|max:250',
            'state'         => 'nullable|string',        
            'path'          => 'nullable|string|max:255',
            'stt'           => 'nullable|regex:/^\d+$/', 
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
            'ma_chuc_nang'  => 'sometimes|required|string|max:250|unique:menu,ma_chuc_nang,' . $menu->id,
            'ma_cha'        => 'nullable|string|max:250|different:ma_chuc_nang|exists:menu,ma_chuc_nang',
            'ten_chuc_nang' => 'sometimes|required|string|max:250',
            'state'         => 'nullable|string',
            'path'          => 'nullable|string|max:255',
            'stt'           => 'nullable|regex:/^\d+$/',
            'trang_thai'    => 'nullable|in:0,1',
        ]);

        // chặn tự tham chiếu (đề phòng khi đổi mã)
        if (isset($data['ma_cha']) && isset($data['ma_chuc_nang']) && $data['ma_cha'] === $data['ma_chuc_nang']) {
            return response()->json(['message' => 'ma_cha không được trùng ma_chuc_nang'], 422);
        }

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
