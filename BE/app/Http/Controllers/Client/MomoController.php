<?php
// app/Http/Controllers/Client/MomoController.php
namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\CheckGhe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\ThanhToan;
use App\Models\DatVe; // đảm bảo có quan hệ tới NguoiDung
use App\Models\DatVeChiTiet;
use App\Models\PhuongThucThanhToan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

// === QR CODE (PHẦN MỚI)
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Storage;
=======
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Storage;



class MomoController extends Controller
{
    public function create(Request $req)
    {
        $req->validate([
            'dat_ve_id' => 'required|integer',
            'amount'    => 'required|numeric',
            'return_url' => 'nullable|url',
            'ma_giam_gia_id' => 'nullable|integer',
        ]);

        $datVe = DatVe::with(['nguoiDung:id,ten,email'])->findOrFail($req->dat_ve_id);
        $user  = $datVe->nguoiDung;

        // 2) Map đúng cột ở bảng nguoi_dung
        $email = $user->email ?? null;
        $hoTen = $user->ten ?? null;  // <<== dùng 'ten' thay vì 'ho_ten'/'name'

        // 3) Fallback an toàn để ho_ten không bị null
        if (!$hoTen || trim($hoTen) === '') {
            $hoTen = $email ? Str::before($email, '@') : 'Khách';
        }


        // ----- Lấy id phương thức MoMo (ảnh bạn id=1) -----
        $momoId = PhuongThucThanhToan::where('nha_cung_cap', 'MOMO')->value('id') ?? 1;
        $orderId = 'momo_' . $datVe->id . '_' . now()->format('YmdHis') . '_' . Str::upper(Str::random(5));
        // ----- Tạo bản ghi thanh_toan (đảm bảo ho_ten != null) -----
        $tt = ThanhToan::create([
            'dat_ve_id'                 => $datVe->id,
            'nguoi_dung_id'             => $datVe->nguoi_dung_id,
            'phuong_thuc_thanh_toan_id' => $momoId,
            'ma_giam_gia_id'            => $datVe->ma_giam_gia_id ?? null,
            'tong_tien_goc'             => (int) $req->amount,
            'email'                     => $email,
            'ho_ten'                    => $hoTen, // luôn có giá trị
            'ma_giao_dich'              => $orderId,
             
        ]);

        // ❷ Gọi MoMo (SANDBOX)
        $partnerCode = config('services.momo.partner_code');
        $accessKey   = config('services.momo.access_key');
        $secretKey   = config('services.momo.secret_key');
        $endpoint    = config('services.momo.endpoint'); // https://test-payment.momo.vn/v2/gateway/api/create


        $orderId = str_pad(random_int(0, 99999999), 8, '0', STR_PAD_LEFT);

        $requestId   = uniqid();
        $amount      = (string)intval($req->amount);
        $orderInfo   = "Thanh toan dat ve #{$datVe->id}";
        $redirectUrl = $req->return_url ?: config('services.momo.return_url');
        $ipnUrl      = config('services.momo.ipn_url');

        // Trang giống ảnh: dùng thẻ ATM nội địa
        $requestType = 'payWithATM';
        // $extraData   = base64_encode(json_encode(['tt_id' => $tt->id]));

        $IdLichChieu = $datVe->lich_chieu_id;
        $IdGhe = $datVe->chiTiet->pluck('ghe_id')->toArray();
            // $IdGhe = $datVe->datVeChiTiet->pluck('ghe_id')->toArray();
        $extraData = base64_encode(json_encode([
            'tt_id' => $tt->id,
            'IdLichChieu' => $IdLichChieu,
            'IdGhe' => $IdGhe,
        ]));

        $raw = "accessKey={$accessKey}&amount={$amount}&extraData={$extraData}&ipnUrl={$ipnUrl}&orderId={$orderId}&orderInfo={$orderInfo}&partnerCode={$partnerCode}&redirectUrl={$redirectUrl}&requestId={$requestId}&requestType={$requestType}";
        $signature = hash_hmac('sha256', $raw, $secretKey);

        $payload = [
            'partnerCode' => $partnerCode,
            'partnerName' => 'MoMo Demo',
            'storeId' => 'MoMoDemo',
            'requestId' => $requestId,
            'amount' => $amount,
            'orderId' => $orderId,
            'orderInfo' => $orderInfo,
            'redirectUrl' => $redirectUrl,
            'ipnUrl' => $ipnUrl,
            'lang' => 'vi',
            'extraData' => $extraData,
            'requestType' => $requestType,
            'signature' => $signature
        ];

        $res = Http::post($endpoint, $payload)->json();

        if (($res['resultCode'] ?? -1) === 0 && !empty($res['payUrl'])) {
            // lưu tạm orderId vào ma_giao_dich để đối chiếu (sẽ cập nhật transId khi IPN)
            $tt->update(['ma_giao_dich' => $orderId]);
            return response()->json(['payment_url' => $res['payUrl'], 'orderId' => $orderId]);
        }

        return response()->json(['message' => $res['message'] ?? 'Tạo đơn MoMo thất bại'], 400);
    }

    public function return(Request $req)
    {
        // Người dùng quay về FE – hiển thị “thành công/thất bại”
        $status = ((int)$req->resultCode === 0) ? 'success' : 'fail';
        $url = config('services.momo.front_result_url', 'http://localhost:5173/ket-qua-thanh-toan');
        return redirect()->to($url . '?status=' . $status . '&message=' . urlencode($req->message ?? ''));
    }
    public function momoIpn(Request $request)
    {
        $orderId = $request->orderId;  // Mã đơn của bạn
        $datVe = DatVe::with('datVeChiTiet')->find($orderId);

        if (!$datVe) {
            return response('Order not found', 404);
        }

        // Kiểm tra chữ ký MoMo -> OK mới xử lý

        foreach ($datVe->datVeChiTiet as $ct) {
            CheckGhe::where('lich_chieu_id', $datVe->lich_chieu_id)
                ->where('ghe_id', $ct->ghe_id)
                ->update([
                    'trang_thai' => 'da_dat',
                    'expires_at' => null
                ]);
        }

        return response('OK', 200);
    }


    public function ipn(Request $req)
    {
        // Giải mã extraData để lấy tt_id
    $extra = json_decode(base64_decode($req->extraData ?? ''), true);
    $ttId  = $extra['tt_id'] ?? null;

    // Không có tt_id => bỏ qua
    if (!$ttId) {
        return response()->json(['message' => 'ignore']);
    }


    $tt = ThanhToan::find($ttId);

    // Không tìm thấy thanh toán
    if (!$tt) {
        return response()->json(['message' => 'ignore']);
    }

    // Lấy đơn vé tương ứng
    $datVe = DatVe::with('datVeChiTiet', 'phim', 'phong')->find($tt->dat_ve_id);

    if (!$datVe) {
        return response()->json(['message' => 'ignore']);
    }



    $tt = ThanhToan::find($ttId);

    // Không tìm thấy thanh toán
    if (!$tt) {
        return response()->json(['message' => 'ignore']);
    }

    // Lấy đơn vé tương ứng
    $datVe = DatVe::with('datVeChiTiet', 'phim', 'phong')->find($tt->dat_ve_id);

    if (!$datVe) {
        return response()->json(['message' => 'ignore']);
    }

    // ============================
    // 1️⃣ THANH TOÁN THẤT BẠI
    // ============================
    if ((int)$req->resultCode !== 0) {

        // Trả ghế về trạng thái trống
        CheckGhe::where('lich_chieu_id', $datVe->lich_chieu_id)
            ->whereIn('ghe_id', $datVe->datVeChiTiet->pluck('ghe_id'))
            ->update([
                'trang_thai' => 'trong',
                'expires_at' => null,
                'nguoi_dung_id' => null
            ]);

        // Cập nhật trạng thái thanh toán
        $tt->update([
            'trang_thai' => 'that_bai',
        ]);

        return response()->json(['message' => 'payment_failed_seats_released']);
    }

    // ============================
    // 2️⃣ THANH TOÁN THÀNH CÔNG
    // ============================
    DB::beginTransaction();
    try {

        // Cập nhật trạng thái thanh toán
        $tt->update([
            'ma_giao_dich' => $req->transId ?? $req->orderId,
            'trang_thai'   => 'da_thanh_toan',
        ]);

        // ---- GHẾ ----
        CheckGhe::where('lich_chieu_id', $datVe->lich_chieu_id)
            ->whereIn('ghe_id', $datVe->datVeChiTiet->pluck('ghe_id'))
            ->update([
                'trang_thai' => 'da_dat',
                'expires_at' => null,
            ]);

        // ====== Tạo QR Code ======
        $gheIds = $datVe->datVeChiTiet->pluck('ghe_id')->toArray();


        $qrContent =
            "Mã vé: {$datVe->id}\n" .
            "Phim: {$datVe->phim->ten_phim}\n" .
            "Phòng: {$datVe->phong->ten_phong}\n" .
            "Ghế: " . implode(', ', $gheIds) . "\n" .
            "Suất chiếu: {$datVe->gio_bat_dau}\n" .
            "Mã giao dịch: {$tt->ma_giao_dich}";

        $qr = QrCode::create($qrContent)->setSize(300)->setMargin(10);
        $writer = new PngWriter();
        $qrImage = $writer->write($qr);

        $fileName = 'qr_' . $datVe->id . '.png';
        $filePath = 'qr/' . $fileName;

        Storage::disk('public')->put($filePath, $qrImage->getString());



        $qrContent =
            "Mã vé: {$datVe->id}\n" .
            "Phim: {$datVe->phim->ten_phim}\n" .
            "Phòng: {$datVe->phong->ten_phong}\n" .
            "Ghế: " . implode(', ', $gheIds) . "\n" .
            "Suất chiếu: {$datVe->gio_bat_dau}\n" .
            "Mã giao dịch: {$tt->ma_giao_dich}";

        $qr = QrCode::create($qrContent)->setSize(300)->setMargin(10);
        $writer = new PngWriter();
        $qrImage = $writer->write($qr);

        $fileName = 'qr_' . $datVe->id . '.png';
        $filePath = 'qr/' . $fileName;

        Storage::disk('public')->put($filePath, $qrImage->getString());


        if (!Storage::disk('public')->exists($filePath)) {
            throw new \Exception("Không thể lưu QR code ($filePath)");
        }

        // Lưu QR vào thanh toán
        $tt->update(['qr_code' => $filePath]);

        DB::commit();

        return response()->json(['message' => 'payment_success']);
=======
return response()->json(['message' => 'payment_success']);


    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['message' => 'error', 'error' => $e->getMessage()], 500);
    }
    }


    public function huyGhe(Request $request)
    {
        $lichChieuId = $request->input('lich_chieu_id');
        $gheIds = $request->input('ghe_ids', []);
        CheckGhe::where('lich_chieu_id', $lichChieuId)
            ->whereIn('ghe_id', $gheIds)
            ->update([
                'trang_thai' => 'trong',
                'nguoi_dung_id' => null
            ]);
            return response()->json(['message' => 'Ghế đã được hủy thành công.']);
    }
}
