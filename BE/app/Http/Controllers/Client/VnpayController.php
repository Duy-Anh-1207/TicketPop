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

class VnpayController extends Controller
{
    public function create(Request $req)
    {
        $req->validate([
            'dat_ve_id'      => 'required|integer',
            'amount'         => 'required|numeric',
            'return_url'     => 'nullable|url',
            'ma_giam_gia_id' => 'nullable|integer',
        ]);

        $datVe = DatVe::with(['nguoiDung:id,ten,email'])->findOrFail($req->dat_ve_id);
        $user  = $datVe->nguoiDung;

        // Lấy thông tin khách giống MoMo
        $email = $user->email ?? null;
        $hoTen = $user->ten   ?? null;

        if (!$hoTen || trim($hoTen) === '') {
            $hoTen = $email ? Str::before($email, '@') : 'Khách';
        }

        // Lấy id phương thức thanh toán VNPAY
        $vnpId = PhuongThucThanhToan::where('nha_cung_cap', 'VNPAY')->value('id') ?? 2;

        // Mã nội bộ tạm
        $localOrderCode = 'vnp_' . $datVe->id . '_' . now()->format('YmdHis') . '_' . Str::upper(Str::random(5));

        // Tạo bản ghi thanh_toan (giống MoMo)
        $tt = ThanhToan::create([
            'dat_ve_id'                 => $datVe->id,
            'nguoi_dung_id'             => $datVe->nguoi_dung_id,
            'phuong_thuc_thanh_toan_id' => $vnpId,
            'ma_giam_gia_id'            => $datVe->ma_giam_gia_id ?? null,
            'tong_tien_goc'             => (int)$req->amount,
            'email'                     => $email,
            'ho_ten'                    => $hoTen,
            'ma_giao_dich'              => $localOrderCode,
        ]);

        // ============ CẤU HÌNH VNPAY ============
        $vnp_Url        = config('services.vnpay.payment_url');
        $vnp_TmnCode    = trim(config('services.vnpay.tmn_code'));
        $vnp_HashSecret = trim(config('services.vnpay.hash_secret'));
        $vnp_ReturnUrl  = config('services.vnpay.return_url');

        // Dùng id thanh_toan làm vnp_TxnRef (đơn giản cho IPN)
        $vnp_TxnRef    = (string)$tt->id;
        $vnp_Amount    = (int)$req->amount * 100; // VNPay yêu cầu *100
        $vnp_Locale    = 'vn';
        $vnp_OrderInfo = "Thanh toan dat ve {$datVe->id}";
        $vnp_OrderType = 'other';
        $vnp_IpAddr    = $req->ip();

        $inputData = [
            "vnp_Version"    => "2.1.0",
            "vnp_TmnCode"    => $vnp_TmnCode,
            "vnp_Amount"     => $vnp_Amount,
            "vnp_Command"    => "pay",
            "vnp_CreateDate" => now()->format('YmdHis'),
            "vnp_CurrCode"   => "VND",
            "vnp_IpAddr"     => $vnp_IpAddr,
            "vnp_Locale"     => $vnp_Locale,
            "vnp_OrderInfo"  => $vnp_OrderInfo,
            "vnp_OrderType"  => $vnp_OrderType,
            "vnp_ReturnUrl"  => $vnp_ReturnUrl,
            "vnp_TxnRef"     => $vnp_TxnRef,
        ];
        // Nếu muốn luôn dùng NCB test:
        // $inputData['vnp_BankCode'] = 'NCB';

        // ====== KÝ CHỮ KÝ GIỐNG DEMO PHP CỦA VNPAY ======
        ksort($inputData);

        $query    = "";
        $hashdata = "";
        $i        = 0;

        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashdata .= '&' . $key . "=" . $value;   // KHÔNG urlencode ở hashdata
            } else {
                $hashdata .= $key . "=" . $value;
                $i = 1;
            }

            // query thì urlencode
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
        $paymentUrl    = $vnp_Url . "?" . $query . "vnp_SecureHash=" . $vnpSecureHash;

        // Lưu lại TxnRef để IPN/return đối chiếu
        $tt->update(['ma_giao_dich' => $vnp_TxnRef]);

        return response()->json([
            'payment_url' => $paymentUrl,
            'orderId'     => $vnp_TxnRef,
        ]);
    }

    public function return(Request $req)
    {
        // Người dùng quay về FE – hiển thị “thành công/thất bại” (giống MoMo)
        $success = $req->vnp_ResponseCode == '00';
        $url     = config('services.vnpay.front_result_url', 'http://localhost:5173/ket-qua-thanh-toan');

        return redirect()->to($url . '?status=' . ($success ? 'success' : 'fail'));
    }

    public function ipn(Request $req)
    {
        $vnp_HashSecret = trim(config('services.vnpay.hash_secret'));
        $dataAll        = $req->all();

        // Lấy hash VNPay gửi
        $receivedHash = $dataAll['vnp_SecureHash'] ?? '';

        // Lọc chỉ lấy các param bắt đầu bằng vnp_
        $inputData = [];
        foreach ($dataAll as $key => $value) {
            if (substr($key, 0, 4) === 'vnp_') {
                $inputData[$key] = $value;
            }
        }

        unset($inputData['vnp_SecureHash'], $inputData['vnp_SecureHashType']);

        ksort($inputData);

        // Build lại chuỗi hashdata giống create()
        $hashdata = "";
        $i        = 0;
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashdata .= '&' . $key . "=" . $value;
            } else {
                $hashdata .= $key . "=" . $value;
                $i = 1;
            }
        }

        $secureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);

        if ($secureHash !== $receivedHash) {
            return response()->json([
                "RspCode" => "97",
                "Message" => "Sai chữ ký",
            ]);
        }

        $vnp_TxnRef            = $inputData['vnp_TxnRef']            ?? null;
        $vnp_ResponseCode      = $inputData['vnp_ResponseCode']      ?? null;
        $vnp_TransactionStatus = $inputData['vnp_TransactionStatus'] ?? null;
        $vnp_Amount            = (int)($inputData['vnp_Amount']      ?? 0);
        $vnp_TransactionNo     = $inputData['vnp_TransactionNo']     ?? null;

        if (!$vnp_TxnRef) {
            return response()->json([
                "RspCode" => "01",
                "Message" => "Thiếu mã đơn hàng",
            ]);
        }

        // Vì vnp_TxnRef = id trong bảng thanh_toan
        $tt = ThanhToan::find((int)$vnp_TxnRef);

        if (!$tt) {
            return response()->json([
                "RspCode" => "01",
                "Message" => "Không tìm thấy đơn hàng",
            ]);
        }

        // Kiểm tra số tiền (VNPay gửi *100)
        if ($vnp_Amount !== (int)$tt->tong_tien_goc * 100) {
            return response()->json([
                "RspCode" => "04",
                "Message" => "Sai số tiền",
            ]);
        }

        if ($tt->trang_thai === 'da_thanh_toan') {
            return response()->json([
                "RspCode" => "00",
                "Message" => "Đơn hàng đã được xác nhận",
            ]);
        }

        // Thành công
        if ($vnp_ResponseCode === '00' && $vnp_TransactionStatus === '00') {
            DB::beginTransaction();
            try {
                $tt->update([
                    'trang_thai'   => 'da_thanh_toan',
                    'ma_giao_dich' => $vnp_TransactionNo ?: $tt->ma_giao_dich,
                ]);

                $datVe = DatVe::with('datVeChiTiet')->find($tt->dat_ve_id);

                if (!$datVe) {
                    throw new \Exception("Không tìm thấy dat_ve để cập nhật ghế");
                }

                CheckGhe::where('lich_chieu_id', $datVe->lich_chieu_id)
                    ->whereIn('ghe_id', $datVe->datVeChiTiet->pluck('ghe_id'))
                    ->update([
                        'trang_thai' => 'da_dat',
                        'expires_at' => null,
                    ]);

                DB::commit();

                return response()->json([
                    "RspCode" => "00",
                    "Message" => "Xác nhận thành công",
                ]);
            } catch (\Exception $e) {
                DB::rollBack();

                return response()->json([
                    "RspCode" => "99",
                    "Message" => "Lỗi hệ thống",
                ]);
            }
        }

        // Thất bại
        $tt->update(['trang_thai' => 'that_bai']);

        return response()->json([
            "RspCode" => "00",
            "Message" => "Thanh toán thất bại",
        ]);
    }
}
