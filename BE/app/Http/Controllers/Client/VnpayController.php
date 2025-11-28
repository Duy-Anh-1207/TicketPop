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
        ]);

        $datVe = DatVe::with(['nguoiDung:id,ten,email'])->findOrFail($req->dat_ve_id);
        $user  = $datVe->nguoiDung;

        $email = $user->email ?? null;
        $hoTen = $user->ten ?: ($email ? Str::before($email, '@') : 'Khách');

        // Lấy id phương thức thanh toán VNPAY
        $vnpId = PhuongThucThanhToan::where('nha_cung_cap', 'VNPAY')->value('id') ?? 2;
        $maGiaoDich = str_pad(random_int(0, 99999999), 8, '0', STR_PAD_LEFT);
        // Tạo bản ghi thanh_toan
        $tt = ThanhToan::create([
            'dat_ve_id'                 => $datVe->id,
            'nguoi_dung_id'             => $datVe->nguoi_dung_id,
            'phuong_thuc_thanh_toan_id' => $vnpId,
            'tong_tien_goc'             => (int)$req->amount,
            'email'                     => $email,
            'ho_ten'                    => $hoTen,
           
            'ma_giao_dich' => $maGiaoDich,
        ]); 

        // ============ CẤU HÌNH VNPAY ============
        $vnp_Url        = config('services.vnpay.payment_url');
        $vnp_TmnCode    = trim(config('services.vnpay.tmn_code'));
        $vnp_HashSecret = trim(config('services.vnpay.hash_secret'));
        $vnp_ReturnUrl  = config('services.vnpay.return_url');

        $inputData = [
            "vnp_Version"    => "2.1.0",
            "vnp_TmnCode"    => $vnp_TmnCode,
            "vnp_Amount"     => (int)$req->amount * 100,
            "vnp_Command"    => "pay",
            "vnp_CreateDate" => now()->format('YmdHis'),
            "vnp_CurrCode"   => "VND",
            "vnp_IpAddr"     => $req->ip(),
            "vnp_Locale"     => "vn",
            "vnp_OrderInfo"  => "Thanh toán đơn đặt vé #" . $datVe->id,
            "vnp_OrderType"  => "other",
            "vnp_ReturnUrl"  => $vnp_ReturnUrl,
            "vnp_TxnRef"     => (string)$tt->id,
        ];

        // ====== BUILD HASHDATA + QUERY ĐÚNG CHUẨN VNPAY ======
        ksort($inputData);

        $hashData  = '';
        $query     = '';
        $i         = 0;

        foreach ($inputData as $key => $value) {
            // hashData: PHẢI urlencode cả key & value
            if ($i == 1) {
                $hashData .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }

            // query string
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        $vnpSecureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        // Với version 2.1.0: KHÔNG gửi vnp_SecureHashType
        $paymentUrl = $vnp_Url . "?" . $query . "vnp_SecureHash=" . $vnpSecureHash;

        // Cập nhật lại mã giao dịch nội bộ = id thanh_toan
        // $tt->update(['ma_giao_dich' => $tt->id]);

        return response()->json([
            'payment_url' => $paymentUrl,
            'orderId'     => $tt->id,
        ]);
    }

    public function return(Request $req)
    {
        $success = $req->vnp_ResponseCode == '00';
        $url     = config('services.vnpay.front_result_url', 'http://localhost:5173/ket-qua-thanh-toan');

        return redirect()->to($url . '?status=' . ($success ? 'success' : 'fail'));
    }

    public function ipn(Request $req)
    {
        $vnp_HashSecret = trim(config('services.vnpay.hash_secret'));
        $dataAll        = $req->all();

        if (!isset($dataAll['vnp_SecureHash'])) {
            return response()->json([
                "RspCode" => "97",
                "Message" => "Sai chữ ký",
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

        $tt = ThanhToan::find((int)$vnp_TxnRef);

        if (!$tt) {
            return response()->json([
                "RspCode" => "01",
                "Message" => "Không tìm thấy đơn hàng",
            ]);
        }

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

        if ($vnp_ResponseCode === '00' && $vnp_TransactionStatus === '00') {
            DB::beginTransaction();
            try {
                $tt->update([
                    'trang_thai'   => 'da_thanh_toan',
                    'ma_giao_dich' => $vnp_TransactionNo ?: $tt->ma_giao_dich,
                ]);

                $datVe = DatVe::with('datVeChiTiet')->find($tt->dat_ve_id);

                if ($datVe) {
                    CheckGhe::where('lich_chieu_id', $datVe->lich_chieu_id)
                        ->whereIn('ghe_id', $datVe->datVeChiTiet->pluck('ghe_id'))
                        ->update([
                            'trang_thai' => 'da_dat',
                            'expires_at' => null,
                        ]);
                }

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

        $tt->update(['trang_thai' => 'that_bai']);

        return response()->json([
            "RspCode" => "00",
            "Message" => "Thanh toán thất bại",
        ]);
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
    public function capNhatTrangThai(Request $request, $id)
    {
        
        $request->validate([
            'da_quet' => 'required|boolean'
        ]);

        
        $thanhToan = ThanhToan::find($id);
        if (!$thanhToan) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thanh toán'
            ], 404);
        }

        
        $thanhToan->da_quet = $request->da_quet;
        $thanhToan->save();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái thành công',
            'data' => $thanhToan
        ]);
    }
}
