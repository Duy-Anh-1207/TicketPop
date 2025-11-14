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

        $orderId     = 'momo_' . $tt->id . '_' . time();
        $requestId   = uniqid();
        $amount      = (string)intval($req->amount);
        $orderInfo   = "Thanh toan dat ve #{$datVe->id}";
        $redirectUrl = $req->return_url ?: config('services.momo.return_url');
        $ipnUrl      = config('services.momo.ipn_url');

        // Trang giống ảnh: dùng thẻ ATM nội địa
        $requestType = 'payWithATM';
        $extraData   = base64_encode(json_encode(['tt_id' => $tt->id]));

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
        $extra = json_decode(base64_decode($req->extraData ?? ''), true);
        $ttId  = $extra['tt_id'] ?? null;

        // Nếu không thành công => bỏ qua
        if (!$ttId || (int)$req->resultCode !== 0) {
            return response()->json(['message' => 'ignore']);
        }

        DB::beginTransaction();
        try {
            $tt = ThanhToan::find($ttId);

            if (!$tt) {
                throw new \Exception("Không tìm thấy bản ghi thanh toán");
            }

            // Cập nhật mã giao dịch thực tế từ MoMo
            $tt->update([
                'ma_giao_dich' => $req->transId ?? $req->orderId,
                'trang_thai'   => 'da_thanh_toan'
            ]);

            // Lấy đơn vé
            $datVe = DatVe::find($tt->dat_ve_id);

            if (!$datVe) {
                throw new \Exception("Không tìm thấy dat_ve để cập nhật ghế");
            }

            // Update ghế sang da_dat
            CheckGhe::where('lich_chieu_id', $datVe->lich_chieu_id)
                ->whereIn('ghe_id', $datVe->datVeChiTiet->pluck('ghe_id'))
                ->update([
                    'trang_thai' => 'da_dat',
                    'expires_at' => null,
                ]);


            DB::commit();
            return response()->json(['message' => 'ok']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'error', 'error' => $e->getMessage()], 500);
        }
    }
}
