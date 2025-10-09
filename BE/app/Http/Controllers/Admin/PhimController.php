<?php
namespace App\Http\Controllers;

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
        $phim = Phim::create($request->validated());
        return response()->json($phim, 201);
    }

    public function show($id)
    {
        return Phim::findOrFail($id);
    }

    public function update(StorePhimRequest $request, $id)
    {
        $phim = Phim::findOrFail($id);
        $phim->update($request->validated());
        return response()->json($phim);
    }

    public function destroy($id)
    {
        $phim = Phim::findOrFail($id);
        $phim->delete();
        return response()->json(null, 204);
    }
}