<?php
// app/Http/Controllers/Client/MomoController.php
namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\CheckGhe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\ThanhToan;
use App\Models\DatVe;
use App\Models\PhuongThucThanhToan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

// QR CODE
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Storage;

class MomoController extends Controller
{
    /**
     * Tạo yêu cầu thanh toán MoMo
     * - KHÔNG tạo bản ghi thanh_toan ở đây
     * - Chỉ gọi MoMo và chờ IPN/return xử lý
     */
    public function create(Request $req)
    {
        $req->validate([
            'dat_ve_id'      => 'required|integer',
            'amount'         => 'required|numeric',
            'return_url'     => 'nullable|url', // url FE muốn redirect về sau khi xong
            'ma_giam_gia_id' => 'nullable|integer',
        ]);

        $datVe = DatVe::with(['nguoiDung:id,ten,email', 'chiTiet'])->findOrFail($req->dat_ve_id);
        $user  = $datVe->nguoiDung;

        $email = $user->email ?? null;
        $hoTen = $user->ten ?? null;
        if (!$hoTen || trim($hoTen) === '') {
            $hoTen = $email ? Str::before($email, '@') : 'Khách';
        }

        $partnerCode = config('services.momo.partner_code');
        $accessKey   = config('services.momo.access_key');
        $secretKey   = config('services.momo.secret_key');
        $endpoint    = config('services.momo.endpoint');

        // orderId gửi lên MoMo
        $orderId   = str_pad(random_int(0, 99999999), 8, '0', STR_PAD_LEFT);
        $requestId = uniqid();
        $amount    = (string) intval($req->amount);
        $orderInfo = "Thanh toán đặt vé #{$datVe->id}";

        // URL backend nhận redirect từ MoMo (route return)
        $redirectUrlBackend = config('services.momo.return_url');

        // URL FE hiển thị kết quả
        $frontResultUrl = $req->return_url ?: config('services.momo.front_result_url', 'http://localhost:5173/ket-qua-thanh-toan');

        $ipnUrl      = config('services.momo.ipn_url');
        $requestType = 'payWithATM';

        $lichChieuId = $datVe->lich_chieu_id;
        $gheIds      = $datVe->chiTiet->pluck('ghe_id')->toArray();

        // extraData: gửi đầy đủ thông tin để IPN / return xử lý
        $extraData = base64_encode(json_encode([
            'dat_ve_id'        => $datVe->id,
            'nguoi_dung_id'    => $datVe->nguoi_dung_id,
            'email'            => $email,
            'ho_ten'           => $hoTen,
            'ma_giam_gia_id'   => $req->ma_giam_gia_id ?? $datVe->ma_giam_gia_id,
            'lich_chieu_id'    => $lichChieuId,
            'ghe_ids'          => $gheIds,
            'tong_tien_goc'    => (int) $req->amount,
            'front_result_url' => $frontResultUrl,
        ]));

        $raw = "accessKey={$accessKey}"
            . "&amount={$amount}"
            . "&extraData={$extraData}"
            . "&ipnUrl={$ipnUrl}"
            . "&orderId={$orderId}"
            . "&orderInfo={$orderInfo}"
            . "&partnerCode={$partnerCode}"
            . "&redirectUrl={$redirectUrlBackend}"
            . "&requestId={$requestId}"
            . "&requestType={$requestType}";

        $signature = hash_hmac('sha256', $raw, $secretKey);

        $payload = [
            'partnerCode' => $partnerCode,
            'partnerName' => 'MoMo Demo',
            'storeId'     => 'MoMoDemo',
            'requestId'   => $requestId,
            'amount'      => $amount,
            'orderId'     => $orderId,
            'orderInfo'   => $orderInfo,
            'redirectUrl' => $redirectUrlBackend,
            'ipnUrl'      => $ipnUrl,
            'lang'        => 'vi',
            'extraData'   => $extraData,
            'requestType' => $requestType,
            'signature'   => $signature,
        ];

        $res = Http::post($endpoint, $payload)->json();

        if (($res['resultCode'] ?? -1) === 0 && !empty($res['payUrl'])) {
            return response()->json([
                'payment_url' => $res['payUrl'],
                'orderId'     => $orderId,
                'message'     => 'Tạo đơn thanh toán MoMo thành công.'
            ]);
        }

        return response()->json([
            'message' => $res['message'] ?? 'Tạo đơn thanh toán MoMo thất bại, vui lòng thử lại.'
        ], 400);
    }

    /**
     * Người dùng quay về từ MoMo (redirectUrl)
     * - Nếu thất bại/hủy: trả ghế, không lưu thanh toán
     * - Nếu thành công: fallback tạo thanh_toan (trong trường hợp IPN không gọi được, như localhost)
     */
    public function return(Request $req)
    {
        // Giải extraData (nếu có)
        $extra = null;
        if (!empty($req->extraData)) {
            $extra = json_decode(base64_decode($req->extraData), true);
        }

        $datVeId        = $extra['dat_ve_id']        ?? null;
        $lichChieuId    = $extra['lich_chieu_id']    ?? null;
        $gheIdsExtra    = $extra['ghe_ids']          ?? [];
        $frontResultUrl = $extra['front_result_url']
            ?? config('services.momo.front_result_url', 'http://localhost:5173/ket-qua-thanh-toan');

        // ❌ THẤT BẠI / HỦY → TRẢ GHẾ
        if ((int)$req->resultCode !== 0 && $lichChieuId && !empty($gheIdsExtra)) {
            CheckGhe::where('lich_chieu_id', $lichChieuId)
                ->whereIn('ghe_id', $gheIdsExtra)
                ->update([
                    'trang_thai'    => 'trong',
                    'expires_at'    => null,
                    'nguoi_dung_id' => null
                ]);
        }

        // ✅ THÀNH CÔNG → Fallback tạo thanh_toan nếu IPN không chạy được (ví dụ localhost)
        if ((int)$req->resultCode === 0 && $datVeId) {

            $datVe = DatVe::with(['chiTiet'])->find($datVeId);

            if ($datVe && !ThanhToan::where('dat_ve_id', $datVe->id)->exists()) {

                $gheIds = $datVe->chiTiet->pluck('ghe_id')->toArray();

                DB::beginTransaction();
                try {
                    $momoId = PhuongThucThanhToan::where('nha_cung_cap', 'MOMO')->value('id') ?? 1;

                    $tt = ThanhToan::create([
                        'dat_ve_id'                 => $datVe->id,
                        'nguoi_dung_id'             => $extra['nguoi_dung_id'] ?? $datVe->nguoi_dung_id,
                        'phuong_thuc_thanh_toan_id' => $momoId,
                        'ma_giam_gia_id'            => $extra['ma_giam_gia_id'] ?? null,
                        'tong_tien_goc'             => $extra['tong_tien_goc'] ?? (int) $req->amount,
                        'email'                     => $extra['email'] ?? null,
                        'ho_ten'                    => $extra['ho_ten'] ?? 'Khách',
                        'ma_giao_dich'              => $req->transId ?? $req->orderId,
                        'trang_thai'                => 'da_thanh_toan',
                    ]);

                    // Cập nhật ghế
                    CheckGhe::where('lich_chieu_id', $datVe->lich_chieu_id)
                        ->whereIn('ghe_id', $gheIds)
                        ->update([
                            'trang_thai' => 'da_dat',
                            'expires_at' => null,
                        ]);

                    // Tạo QR (không dùng quan hệ phim/phong để tránh lỗi)
                    $suatChieu = $datVe->gio_bat_dau ?? '';
                    $suatChieu = $datVe->gio_bat_dau ?? '';
                    $tenKhach  = $tt->ho_ten ?? 'Khách';
                    $emailKH   = $tt->email ?? '';

                    // Định dạng tiền
                    $tongTien = number_format($tt->tong_tien_goc ?? 0, 0, ',', '.');

                    $qrContent =
                        "VÉ XEM PHIM\n" .
                        "---------------------\n" .
                        "Mã vé: {$datVe->id}\n" .
                        "Khách hàng: {$tenKhach}\n" .
                        ($emailKH ? "Email: {$emailKH}\n" : "") .
                        "Ghế: " . implode(', ', $gheIds) . "\n" .
                        ($suatChieu ? "Suất chiếu: {$suatChieu}\n" : "") .
                        "Tổng tiền: {$tongTien} VND\n" .
                        "Trạng thái: ĐÃ THANH TOÁN\n" .
                        "Mã giao dịch: {$tt->ma_giao_dich}";

                    $qr     = QrCode::create($qrContent)->setSize(300)->setMargin(10);
                    $writer = new PngWriter();
                    $qrImage = $writer->write($qr);

                    $fileName = 'qr_' . $datVe->id . '.png';
                    $filePath = 'qr/' . $fileName;

                    Storage::disk('public')->put($filePath, $qrImage->getString());

                    if (Storage::disk('public')->exists($filePath)) {
                        $tt->update(['qr_code' => $filePath]);
                    }

                    DB::commit();
                } catch (\Exception $e) {
                    DB::rollBack();
                    // Nếu lỗi, vẫn cho redirect về FE, log sau
                }
            }
        }

        // Redirect về FE
        $status  = ((int)$req->resultCode === 0) ? 'success' : 'fail';
        $message = $req->message ?? '';

        return redirect()->to(
            $frontResultUrl
                . '?status=' . $status
                . '&message=' . urlencode($message)
        );
    }

    /**
     * IPN – MoMo gọi server to server
     * - Nếu thất bại → trả ghế, KHÔNG lưu thanh_toan
     * - Nếu thành công → tạo / cập nhật thanh_toan, cập nhật ghế, tạo QR
     */
    public function ipn(Request $req)
    {
        $extra = json_decode(base64_decode($req->extraData ?? ''), true);

        if (!$extra || empty($extra['dat_ve_id'])) {
            return response()->json(['message' => 'Thiếu dữ liệu extraData'], 400);
        }

        $datVe = DatVe::with(['chiTiet'])->find($extra['dat_ve_id']);
        if (!$datVe) {
            return response()->json(['message' => 'Không tìm thấy đơn đặt vé'], 404);
        }

        $gheIds = $datVe->chiTiet->pluck('ghe_id')->toArray();

        // ❌ THANH TOÁN THẤT BẠI → trả ghế, KHÔNG lưu thanh_toan
        if ((int)$req->resultCode !== 0) {
            CheckGhe::where('lich_chieu_id', $datVe->lich_chieu_id)
                ->whereIn('ghe_id', $gheIds)
                ->update([
                    'trang_thai'    => 'trong',
                    'expires_at'    => null,
                    'nguoi_dung_id' => null
                ]);

            return response()->json(['message' => 'Thanh toán thất bại, ghế đã được trả, không lưu thanh toán.']);
        }

        // ✅ THANH TOÁN THÀNH CÔNG → tạo / cập nhật bản ghi thanh_toan
        DB::beginTransaction();
        try {
            $momoId = PhuongThucThanhToan::where('nha_cung_cap', 'MOMO')->value('id') ?? 1;

            // Idempotent: nếu đã có thanh toán cho dat_ve này thì cập nhật, tránh tạo trùng
            $tt = ThanhToan::where('dat_ve_id', $datVe->id)->first();

            if (!$tt) {
                $tt = ThanhToan::create([
                    'dat_ve_id'                 => $datVe->id,
                    'nguoi_dung_id'             => $extra['nguoi_dung_id'] ?? $datVe->nguoi_dung_id,
                    'phuong_thuc_thanh_toan_id' => $momoId,
                    'ma_giam_gia_id'            => $extra['ma_giam_gia_id'] ?? null,
                    'tong_tien_goc'             => $extra['tong_tien_goc'] ?? (int) $req->amount,
                    'email'                     => $extra['email'] ?? null,
                    'ho_ten'                    => $extra['ho_ten'] ?? 'Khách',
                    'ma_giao_dich'              => $req->transId ?? $req->orderId,
                    'trang_thai'                => 'da_thanh_toan',
                ]);
            } else {
                $tt->update([
                    'ma_giao_dich' => $req->transId ?? $req->orderId ?? $tt->ma_giao_dich,
                    'trang_thai'   => 'da_thanh_toan',
                ]);
            }

            // Cập nhật ghế -> đã đặt
            CheckGhe::where('lich_chieu_id', $datVe->lich_chieu_id)
                ->whereIn('ghe_id', $gheIds)
                ->update([
                    'trang_thai' => 'da_dat',
                    'expires_at' => null,
                ]);

            // Tạo QR (nếu chưa có)
            if (empty($tt->qr_code)) {
                $suatChieu = $datVe->gio_bat_dau ?? '';

                $suatChieu = $datVe->gio_bat_dau ?? '';
                $tenKhach  = $tt->ho_ten ?? 'Khách';
                $emailKH   = $tt->email ?? '';

                $tongTien = number_format($tt->tong_tien_goc ?? 0, 0, ',', '.');

                $qrContent =
                    "VÉ XEM PHIM\n" .
                    "---------------------\n" .
                    "Mã vé: {$datVe->id}\n" .
                    "Khách hàng: {$tenKhach}\n" .
                    ($emailKH ? "Email: {$emailKH}\n" : "") .
                    "Ghế: " . implode(', ', $gheIds) . "\n" .
                    ($suatChieu ? "Suất chiếu: {$suatChieu}\n" : "") .
                    "Tổng tiền: {$tongTien} VND\n" .
                    "Trạng thái: ĐÃ THANH TOÁN\n" .
                    "Mã giao dịch: {$tt->ma_giao_dich}";

                $qr     = QrCode::create($qrContent)->setSize(300)->setMargin(10);
                $writer = new PngWriter();
                $qrImage = $writer->write($qr);

                $fileName = 'qr_' . $datVe->id . '.png';
                $filePath = 'qr/' . $fileName;

                Storage::disk('public')->put($filePath, $qrImage->getString());

                if (Storage::disk('public')->exists($filePath)) {
                    $tt->update(['qr_code' => $filePath]);
                }
            }

            DB::commit();
            return response()->json(['message' => 'Thanh toán thành công, đã tạo/cập nhật thanh toán và QR.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Lỗi xử lý IPN.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Huỷ ghế thủ công (API riêng – nếu FE cần gọi khi timeout, v.v.)
     */
    public function huyGhe(Request $request)
    {
        $lichChieuId = $request->input('lich_chieu_id');
        $gheIds      = $request->input('ghe_ids', []);

        CheckGhe::where('lich_chieu_id', $lichChieuId)
            ->whereIn('ghe_id', $gheIds)
            ->update([
                'trang_thai'    => 'trong',
                'nguoi_dung_id' => null,
                'expires_at'    => null,
            ]);

        return response()->json(['message' => 'Ghế đã được hủy thành công.']);
    }

    /**
     * Cập nhật trạng thái đã quét vé (check-in)
     */
    public function capNhatTrangThai(Request $request)
    {
        $request->validate([
        'thanh_toan_id' => 'required|integer',
        'da_quet'       => 'required|boolean',
    ]);

    // Tìm thanh toán theo ID
    $thanhToan = ThanhToan::find($request->thanh_toan_id);

    if (!$thanhToan) {
        return response()->json([
            'success' => false,
            'message' => 'Không tìm thấy thanh toán'
        ], 404);
    }

    // Nếu đã quét rồi thì báo luôn
    if ($thanhToan->da_quet) {
        return response()->json([
            'success' => false,
            'message' => 'Vé đã được quét trước đó',
            'data'    => $thanhToan
        ]);
    }

    $thanhToan->da_quet = $request->da_quet;
    $thanhToan->save();

    return response()->json([
        'success' => true,
        'message' => 'Quét vé thành công',
        'data'    => $thanhToan
    ]);
    }
}
