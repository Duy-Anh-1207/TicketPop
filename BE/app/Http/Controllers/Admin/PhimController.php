<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Phim;
use Illuminate\Http\Request;
use App\Http\Requests\StorePhimRequest;

class PhimController extends Controller
{
    public function index()
    {
        return Phim::all();
    }

    public function store(StorePhimRequest $request)
{
    $data = $request->validated();

    // Nếu DB dùng JSON column và model cast array -> không cần json_encode
    // Nếu DB dùng varchar, uncomment json_encode lines
    if (isset($data['phien_ban_id']) && is_array($data['phien_ban_id'])) {
        // $data['phien_ban_id'] = json_encode($data['phien_ban_id']); // nếu cần
    }
    if (isset($data['the_loai_id']) && is_array($data['the_loai_id'])) {
        // $data['the_loai_id'] = json_encode($data['the_loai_id']); // nếu cần
    }

    $phim = Phim::create($data);
    return response()->json($phim, 201);
}

public function update(StorePhimRequest $request, $id)
{
    $phim = Phim::findOrFail($id);
    $data = $request->validated();

    if (isset($data['phien_ban_id']) && is_array($data['phien_ban_id'])) {
        // $data['phien_ban_id'] = json_encode($data['phien_ban_id']);
    }
    if (isset($data['the_loai_id']) && is_array($data['the_loai_id'])) {
        // $data['the_loai_id'] = json_encode($data['the_loai_id']);
    }

    $phim->update($data);
    return response()->json($phim);
}


    public function destroy($id)
    {
        $phim = Phim::findOrFail($id);
        $phim->delete();
        return response()->json(null, 204);
    }
}