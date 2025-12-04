<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\CheckGhe;
use App\Models\ThanhToan;
use App\Models\DatVe;
use App\Models\PhuongThucThanhToan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\ThanhToanThanhCong;

// QR CODE
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Storage;

class VnpayController extends Controller
{
    /**
     * Tạo yêu cầu thanh toán VNPAY
     * - KHÔNG tạo bản ghi thanh_toan ở đây
     * - Chỉ gọi VNPAY và chờ IPN/return xử lý (giống MoMo)
     */
    public function create(Request $req)
    {
        $req->validate([
            'dat_ve_id'      => 'required|integer',
            'amount'         => 'required|numeric',
            'return_url'     => 'nullable|url',      // URL FE hiển thị kết quả
            'ma_giam_gia_id' => 'nullable|integer',
        ]);

        $datVe = DatVe::with(['nguoiDung:id,ten,email', 'chiTiet.ghe'])->findOrFail($req->dat_ve_id);
        $user  = $datVe->nguoiDung;

        $email = $user->email ?? null;
        $hoTen = $user->ten ?? null;
        if (!$hoTen || trim($hoTen) === '') {
            $hoTen = $email ? Str::before($email, '@') : 'Khách';
        }

        // URL FE hiển thị kết quả
        $frontResultUrl = $req->return_url ?: config('services.vnpay.front_result_url', 'http://localhost:5173/ket-qua-thanh-toan');

        // ============ CẤU HÌNH VNPAY ============
        $vnp_Url        = config('services.vnpay.payment_url');
        $vnp_TmnCode    = trim(config('services.vnpay.tmn_code'));
        $vnp_HashSecret = trim(config('services.vnpay.hash_secret'));
        $vnp_ReturnUrlBackend = config('services.vnpay.return_url');

        // Gắn front_result_url vào query để hàm return() đọc lại
        $vnp_ReturnUrl = $vnp_ReturnUrlBackend . '?front_result_url=' . urlencode($frontResultUrl);

        // Dùng dat_ve_id làm mã đơn hàng gửi lên VNPAY
        $vnp_TxnRef = (string) $datVe->id;

        $amount = (int) $req->amount;

        $inputData = [
            "vnp_Version"    => "2.1.0",
            "vnp_TmnCode"    => $vnp_TmnCode,
            "vnp_Amount"     => $amount * 100, // nhân 100 theo quy định VNPAY
            "vnp_Command"    => "pay",
            "vnp_CreateDate" => now()->format('YmdHis'),
            "vnp_CurrCode"   => "VND",
            "vnp_IpAddr"     => $req->ip(),
            "vnp_Locale"     => "vn",
            "vnp_OrderInfo"  => "Thanh toán đơn đặt vé #" . $datVe->id,
            "vnp_OrderType"  => "other",
            "vnp_ReturnUrl"  => $vnp_ReturnUrl,
            "vnp_TxnRef"     => $vnp_TxnRef,
        ];

        ksort($inputData);

        $hashData = '';
        $query    = '';
        $i        = 0;

        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashData .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }

            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        $vnpSecureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        // Với version 2.1.0: KHÔNG gửi vnp_SecureHashType
        $paymentUrl = $vnp_Url . "?" . $query . "vnp_SecureHash=" . $vnpSecureHash;

        return response()->json([
            'payment_url' => $paymentUrl,
            'orderId'     => $vnp_TxnRef,
            'message'     => 'Tạo đơn thanh toán VNPAY thành công.',
        ]);
    }

    /**
     * Người dùng quay về từ VNPAY (ReturnUrl)
     * - Nếu thất bại/hủy: trả ghế, KHÔNG lưu thanh toán
     * - Nếu thành công: fallback tạo thanh_toan (nếu IPN không chạy)
     */
    public function return(Request $req)
    {
        $datVeId   = $req->input('vnp_TxnRef');
        $success   = $req->input('vnp_ResponseCode') === '00'
            && $req->input('vnp_TransactionStatus') === '00';

        $frontResultUrl = $req->query('front_result_url', config('services.vnpay.front_result_url', 'http://localhost:5173/ket-qua-thanh-toan'));

        $tt = null;

        if ($datVeId) {
            $datVe = DatVe::with(['chiTiet.ghe', 'nguoiDung:id,ten,email'])->find($datVeId);

            if ($datVe) {
                $gheNames = $datVe->chiTiet->map(function ($ct) {
                    if ($ct->ghe) {
                        return $ct->ghe->ten_hien_thi ?? $ct->ghe->ten_ghe ?? $ct->ghe_id;
                    }
                    return $ct->ghe_id;
                })->toArray();
                $gheIds   = $datVe->chiTiet->pluck('ghe_id')->toArray();
                $gheText  = implode(', ', $gheNames);

                // ❌ THẤT BẠI / HỦY → TRẢ GHẾ
                if (!$success) {
                    CheckGhe::where('lich_chieu_id', $datVe->lich_chieu_id)
                        ->whereIn('ghe_id', $gheIds)
                        ->update([
                            'trang_thai'    => 'trong',
                            'expires_at'    => null,
                            'nguoi_dung_id' => null,
                        ]);
                }

                // ✅ THÀNH CÔNG → Fallback tạo thanh_toan nếu IPN không chạy
                if ($success && !ThanhToan::where('dat_ve_id', $datVe->id)->exists()) {
                    DB::beginTransaction();
                    try {
                        $vnpId = PhuongThucThanhToan::where('nha_cung_cap', 'VNPAY')->value('id') ?? 2;

                        $user  = $datVe->nguoiDung;
                        $email = $user->email ?? null;
                        $hoTen = $user->ten ?? null;
                        if (!$hoTen || trim($hoTen) === '') {
                            $hoTen = $email ? Str::before($email, '@') : 'Khách';
                        }

                        $amountFromVnp = (int) ($req->input('vnp_Amount', 0) / 100);

                        $tt = ThanhToan::create([
                            'dat_ve_id'                 => $datVe->id,
                            'nguoi_dung_id'             => $datVe->nguoi_dung_id,
                            'phuong_thuc_thanh_toan_id' => $vnpId,
                            'ma_giam_gia_id'            => $datVe->ma_giam_gia_id ?? null,
                            'tong_tien_goc'             => $amountFromVnp,
                            'email'                     => $email,
                            'ho_ten'                    => $hoTen,
                            'ma_giao_dich'              => $req->input('vnp_TransactionNo') ?? $datVeId,
                            'trang_thai'                => 'da_thanh_toan',
                        ]);

                        // Cập nhật ghế
                        CheckGhe::where('lich_chieu_id', $datVe->lich_chieu_id)
                            ->whereIn('ghe_id', $gheIds)
                            ->update([
                                'trang_thai' => 'da_dat',
                                'expires_at' => null,
                            ]);

                        // Tạo QR
                        $suatChieu = $datVe->gio_bat_dau ?? '';
                        $tenKhach  = $tt->ho_ten ?? 'Khách';
                        $emailKH   = $tt->email ?? '';
                        $tongTien  = number_format($tt->tong_tien_goc ?? 0, 0, ',', '.');

                        $qrContent =
                            "VÉ XEM PHIM\n" .
                            "---------------------\n" .
                            "Mã vé: {$datVe->id}\n" .
                            "Khách hàng: {$tenKhach}\n" .
                            ($emailKH ? "Email: {$emailKH}\n" : "") .
                            "Ghế: " . $gheText . "\n" .
                            ($suatChieu ? "Suất chiếu: {$suatChieu}\n" : "") .
                            "Tổng tiền: {$tongTien} VND\n" .
                            "Trạng thái: ĐÃ THANH TOÁN\n" .
                            "Mã giao dịch: {$tt->ma_giao_dich}";

                        $qr      = QrCode::create($qrContent)->setSize(300)->setMargin(10);
                        $writer  = new PngWriter();
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
                        // Nếu lỗi, vẫn redirect về FE, có thể log lại
                    }
                }
            }
        }

        // Gửi mail fallback nếu có tạo thanh toán
        if ($tt && $tt->email) {
            Mail::to($tt->email)->send(new ThanhToanThanhCong($tt));
        }

        $status  = $success ? 'success' : 'fail';
        $message = $success ? 'Thanh toán VNPAY thành công.' : 'Thanh toán VNPAY thất bại hoặc bị hủy.';

        return redirect()->to(
            $frontResultUrl
            . '?status=' . $status
            . '&message=' . urlencode($message)
        );
    }

    /**
     * IPN – VNPAY gọi server to server
     * - Nếu thất bại → trả ghế, KHÔNG lưu thanh_toan
     * - Nếu thành công → tạo / cập nhật thanh_toan, cập nhật ghế, tạo QR
     */
    public function ipn(Request $req)
    {
        $vnp_HashSecret = trim(config('services.vnpay.hash_secret'));
        $dataAll        = $req->all();

        if (!isset($dataAll['vnp_SecureHash'])) {
            return response()->json([
                "RspCode" => "97",
                "Message" => "Sai chữ ký.",
            ]);
        }

        $receivedHash = $dataAll['vnp_SecureHash'];

        // Lọc param vnp_*
        $inputData = [];
        foreach ($dataAll as $key => $value) {
            if (substr($key, 0, 4) === 'vnp_') {
                $inputData[$key] = $value;
            }
        }

        unset($inputData['vnp_SecureHash'], $inputData['vnp_SecureHashType']);

        ksort($inputData);

        // Build hashData GIỐNG HỆT create()
        $hashData = '';
        $i        = 0;
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashData .= '&' . urlencode($key) . '=' . urlencode($value);
            } else {
                $hashData .= urlencode($key) . '=' . urlencode($value);
                $i = 1;
            }
        }

        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        if ($secureHash !== $receivedHash) {
            return response()->json([
                "RspCode" => "97",
                "Message" => "Sai chữ ký.",
            ]);
        }

        $vnp_TxnRef            = $inputData['vnp_TxnRef']            ?? null; // dat_ve_id
        $vnp_ResponseCode      = $inputData['vnp_ResponseCode']      ?? null;
        $vnp_TransactionStatus = $inputData['vnp_TransactionStatus'] ?? null;
        $vnp_Amount            = (int) ($inputData['vnp_Amount']     ?? 0);
        $vnp_TransactionNo     = $inputData['vnp_TransactionNo']     ?? null;

        if (!$vnp_TxnRef) {
            return response()->json([
                "RspCode" => "01",
                "Message" => "Thiếu mã đơn hàng.",
            ]);
        }

        // Lấy datVe theo vnp_TxnRef
        $datVe = DatVe::with(['chiTiet.ghe', 'nguoiDung:id,ten,email'])->find((int) $vnp_TxnRef);
        if (!$datVe) {
            return response()->json([
                "RspCode" => "01",
                "Message" => "Không tìm thấy đơn đặt vé.",
            ]);
        }

        $gheNames = $datVe->chiTiet->map(function ($ct) {
            if ($ct->ghe) {
                return $ct->ghe->ten_hien_thi ?? $ct->ghe->ten_ghe ?? $ct->ghe_id;
            }
            return $ct->ghe_id;
        })->toArray();
        $gheIds  = $datVe->chiTiet->pluck('ghe_id')->toArray();
        $gheText = implode(', ', $gheNames);

        // Kiểm tra số tiền (nếu muốn chặt chẽ hơn, dùng datVe->tong_tien)
        $expectedAmount = (int) ($datVe->tong_tien ?? 0) * 100;
        if ($expectedAmount > 0 && $vnp_Amount !== $expectedAmount) {
            return response()->json([
                "RspCode" => "04",
                "Message" => "Sai số tiền.",
            ]);
        }

        // ❌ THANH TOÁN THẤT BẠI → trả ghế, KHÔNG lưu thanh_toan
        if (!($vnp_ResponseCode === '00' && $vnp_TransactionStatus === '00')) {
            CheckGhe::where('lich_chieu_id', $datVe->lich_chieu_id)
                ->whereIn('ghe_id', $gheIds)
                ->update([
                    'trang_thai'    => 'trong',
                    'expires_at'    => null,
                    'nguoi_dung_id' => null,
                ]);

            return response()->json([
                "RspCode" => "00",
                "Message" => "Thanh toán thất bại, ghế đã được trả, không lưu thanh toán.",
            ]);
        }

        // ✅ THANH TOÁN THÀNH CÔNG → tạo / cập nhật bản ghi thanh_toan giống MoMo
        DB::beginTransaction();
        try {
            $vnpId = PhuongThucThanhToan::where('nha_cung_cap', 'VNPAY')->value('id') ?? 2;

            $user  = $datVe->nguoiDung;
            $email = $user->email ?? null;
            $hoTen = $user->ten ?? null;
            if (!$hoTen || trim($hoTen) === '') {
                $hoTen = $email ? Str::before($email, '@') : 'Khách';
            }

            $amountReal = (int) ($vnp_Amount / 100);

            // Idempotent: nếu đã có thanh toán cho dat_ve này thì cập nhật, tránh tạo trùng
            $tt = ThanhToan::where('dat_ve_id', $datVe->id)->first();

            if (!$tt) {
                $tt = ThanhToan::create([
                    'dat_ve_id'                 => $datVe->id,
                    'nguoi_dung_id'             => $datVe->nguoi_dung_id,
                    'phuong_thuc_thanh_toan_id' => $vnpId,
                    'ma_giam_gia_id'            => $datVe->ma_giam_gia_id ?? null,
                    'tong_tien_goc'             => $amountReal,
                    'email'                     => $email,
                    'ho_ten'                    => $hoTen,
                    'ma_giao_dich'              => $vnp_TransactionNo ?? $vnp_TxnRef,
                    'trang_thai'                => 'da_thanh_toan',
                ]);
            } else {
                $tt->update([
                    'ma_giao_dich' => $vnp_TransactionNo ?? $tt->ma_giao_dich,
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

            // Tạo QR (nếu chưa có) giống MoMo
            if (empty($tt->qr_code)) {
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
                    "Ghế: " . $gheText . "\n" .
                    ($suatChieu ? "Suất chiếu: {$suatChieu}\n" : "") .
                    "Tổng tiền: {$tongTien} VND\n" .
                    "Trạng thái: ĐÃ THANH TOÁN\n" .
                    "Mã giao dịch: {$tt->ma_giao_dich}";

                $qr      = QrCode::create($qrContent)->setSize(300)->setMargin(10);
                $writer  = new PngWriter();
                $qrImage = $writer->write($qr);

                $fileName = 'qr_' . $datVe->id . '.png';
                $filePath = 'qr/' . $fileName;

                Storage::disk('public')->put($filePath, $qrImage->getString());

                if (Storage::disk('public')->exists($filePath)) {
                    $tt->update(['qr_code' => $filePath]);
                }
            }

            DB::commit();

            // Gửi email sau khi commit
            if ($tt->email) {
                Mail::to($tt->email)->send(new ThanhToanThanhCong($tt));
            }

            return response()->json([
                "RspCode" => "00",
                "Message" => "Xác nhận thành công, đã tạo/cập nhật thanh toán, sinh QR và gửi email.",
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                "RspCode" => "99",
                "Message" => "Lỗi hệ thống khi xử lý IPN.",
            ]);
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
     * Cập nhật trạng thái đã quét vé (check-in) – giống MoMo
     */
    public function capNhatTrangThai(Request $request)
    {
        $request->validate([
            'thanh_toan_id' => 'required|integer',
            'da_quet'       => 'required|boolean',
        ]);

        $thanhToan = ThanhToan::find($request->thanh_toan_id);

        if (!$thanhToan) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thanh toán.',
            ], 404);
        }

        // Nếu đã quét rồi thì báo luôn
        if ($thanhToan->da_quet) {
            return response()->json([
                'success' => false,
                'message' => 'Vé đã được quét trước đó.',
                'data'    => $thanhToan,
            ]);
        }

        $thanhToan->da_quet = $request->da_quet;
        $thanhToan->save();

        return response()->json([
            'success' => true,
            'message' => 'Quét vé thành công.',
            'data'    => $thanhToan,
        ]);
    }
}
