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
    /**
     * Tạo URL thanh toán VNPay
     * Body FE gửi:
     *  - dat_ve_id
     *  - amount
     *  - return_url (optional, override config)
     *  - ma_giam_gia_id (optional)
     */
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

        $email = $user->email ?? null;
        $hoTen = $user->ten ?? null;

        if (!$hoTen || trim($hoTen) === '') {
            $hoTen = $email ? Str::before($email, '@') : 'Khách';
        }

        // Lấy id phương thức thanh toán VNPAY (bạn nhớ có bản ghi nhà cung cấp = 'VNPAY')
        $vnpId = PhuongThucThanhToan::where('nha_cung_cap', 'VNPAY')->value('id') ?? 2;

        // Mã tham chiếu nội bộ
        $localOrderCode = 'vnp_' . $datVe->id . '_' . now()->format('YmdHis') . '_' . Str::upper(Str::random(5));

        // Lưu bản ghi thanh_toan
        $tt = ThanhToan::create([
            'dat_ve_id'                 => $datVe->id,
            'nguoi_dung_id'             => $datVe->nguoi_dung_id,
            'phuong_thuc_thanh_toan_id' => $vnpId,
            'ma_giam_gia_id'            => $datVe->ma_giam_gia_id ?? null,
            'tong_tien_goc'             => (int) $req->amount,
            'email'                     => $email,
            'ho_ten'                    => $hoTen,
            'ma_giao_dich'              => $localOrderCode, // tạm, sẽ update sau khi IPN
        ]);

        // ================== CHUẨN BỊ DỮ LIỆU GỬI VNPAY ==================
        $vnp_Url        = config('services.vnpay.payment_url');
        $vnp_TmnCode    = config('services.vnpay.tmn_code');
        $vnp_HashSecret = config('services.vnpay.hash_secret');
        $vnp_ReturnUrl  = $req->return_url ?: config('services.vnpay.return_url');
        $vnp_IpnUrl     = config('services.vnpay.ipn_url');

        // vnp_TxnRef (8-32 ký tự) – dùng id thanh_toan để lần lại
        $vnp_TxnRef    = 'VNP' . $tt->id;
        // VNPay yêu cầu amount * 100 (VND -> số nhỏ nhất)
        $vnp_Amount    = (int)$req->amount * 100;
        $vnp_Locale    = 'vn';
        $vnp_OrderInfo = "Thanh toan dat ve #{$datVe->id}";
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

        // Nếu bạn muốn truyền thêm ipn url qua tham số (tùy cấu hình cổng):
        // $inputData['vnp_IpnUrl'] = $vnp_IpnUrl;

        // Nếu muốn ép dùng 1 bank/1 method thì thêm:
        // $inputData['vnp_BankCode'] = 'VNBANK'; // hoặc 'INTCARD' etc.

        // Build query, sort theo key
        ksort($inputData);
        $query    = "";
        $hashdata = "";
        $i        = 0;
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashdata .= '&' . $key . "=" . $value;
            } else {
                $hashdata .= $key . "=" . $value;
                $i = 1;
            }
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        $vnp_Url = $vnp_Url . "?" . $query;
        if ($vnp_HashSecret) {
            $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
            $vnp_Url      .= 'vnp_SecureHash=' . $vnpSecureHash;
        }

        // có thể lưu luôn vnp_TxnRef để đối chiếu
        $tt->update([
            'ma_giao_dich' => $vnp_TxnRef,
        ]);

        return response()->json([
            'payment_url' => $vnp_Url,
            'orderId'     => $vnp_TxnRef,
        ]);
    }

    /**
     * User thanh toán xong, VNPay redirect về URL này.
     * Ở đây chỉ lo redirect sang FE + trạng thái, không xử lý DB (để IPN xử lý).
     */
    public function return(Request $req)
    {
        // VNPay trả về vnp_ResponseCode = '00' nếu thành công
        $status = ($req->vnp_ResponseCode == '00') ? 'success' : 'fail';

        $url = config('services.vnpay.front_result_url', 'http://localhost:5173/ket-qua-thanh-toan');
        $message = $status === 'success'
            ? 'Thanh toán VNPay thành công'
            : 'Thanh toán VNPay thất bại (mã: ' . ($req->vnp_ResponseCode ?? 'N/A') . ')';

        return redirect()->to($url . '?status=' . $status . '&message=' . urlencode($message));
    }

    /**
     * IPN từ VNPay gọi (server-to-server) – xử lý chính xác trạng thái thanh toán.
     * Bạn cấu hình URL này trong portal VNPay hoặc dùng vnp_IpnUrl nếu cổng hỗ trợ.
     */
    public function ipn(Request $req)
    {
        $inputData = $req->all();
        $vnp_HashSecret = config('services.vnpay.hash_secret');

        $vnp_SecureHash = $inputData['vnp_SecureHash'] ?? '';
        unset($inputData['vnp_SecureHash'], $inputData['vnp_SecureHashType']);

        // sort và build chuỗi hashdata
        ksort($inputData);
        $hashData = urldecode(http_build_query($inputData, '', '&'));

        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        if ($secureHash !== $vnp_SecureHash) {
            return response()->json([
                "RspCode" => "97",
                "Message" => "Chu ky khong hop le"
            ]);
        }

        $vnp_TxnRef           = $inputData['vnp_TxnRef'] ?? null; // VNP + thanh_toan_id
        $vnp_ResponseCode     = $inputData['vnp_ResponseCode'] ?? null;
        $vnp_TransactionStatus= $inputData['vnp_TransactionStatus'] ?? null;
        $vnp_TransactionNo    = $inputData['vnp_TransactionNo'] ?? null;

        if (!$vnp_TxnRef) {
            return response()->json([
                "RspCode" => "01",
                "Message" => "Missing order"
            ]);
        }

        // Tìm thanh toán theo ma_giao_dich (đã lưu vnp_TxnRef)
        $tt = ThanhToan::where('ma_giao_dich', $vnp_TxnRef)->first();

        if (!$tt) {
            return response()->json([
                "RspCode" => "02",
                "Message" => "Order not found"
            ]);
        }

        // Nếu đã xử lý rồi, trả OK luôn tránh xử lý lại
        if ($tt->trang_thai === 'da_thanh_toan') {
            return response()->json([
                "RspCode" => "00",
                "Message" => "Order already confirmed"
            ]);
        }

        // Kiểm tra thành công
        if ($vnp_ResponseCode == '00' && $vnp_TransactionStatus == '00') {
            DB::beginTransaction();
            try {
                // Cập nhật thanh toán
                $tt->update([
                    'ma_giao_dich' => $vnp_TransactionNo ?: $tt->ma_giao_dich,
                    'trang_thai'   => 'da_thanh_toan',
                ]);

                $datVe = DatVe::with('datVeChiTiet')->find($tt->dat_ve_id);

                if (!$datVe) {
                    throw new \Exception("Không tìm thấy dat_ve để cập nhật ghế");
                }

                // Cập nhật trạng thái ghế giống MoMo
                CheckGhe::where('lich_chieu_id', $datVe->lich_chieu_id)
                    ->whereIn('ghe_id', $datVe->datVeChiTiet->pluck('ghe_id'))
                    ->update([
                        'trang_thai' => 'da_dat',
                        'expires_at' => null,
                    ]);

                DB::commit();

                return response()->json([
                    "RspCode" => "00",
                    "Message" => "Confirm Success"
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json([
                    "RspCode" => "99",
                    "Message" => "Loi he thong: " . $e->getMessage()
                ]);
            }
        } else {
            // Thanh toán thất bại
            $tt->update([
                'trang_thai' => 'that_bai',
            ]);

            return response()->json([
                "RspCode" => "00",
                "Message" => "Payment Failed"
            ]);
        }
    }
}
