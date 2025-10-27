import { useParams, useNavigate } from "react-router-dom";
import { useLichChieuDetail } from "../../../hook/useLichChieu";

export default function LichChieuDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: lichChieu, isLoading } = useLichChieuDetail(id || "");

    if (isLoading) return <p className="text-center">Đang tải dữ liệu...</p>;
    if (!lichChieu) return <p className="text-center text-danger">Không tìm thấy lịch chiếu!</p>;

    return (
        <div className="container p-4">
            <h3 className="mb-4">📅 Chi tiết lịch chiếu #{lichChieu.id}</h3>

            <table className="table table-bordered">
                <tbody>
                    <tr>
                        <th>Phim</th>
                        <td>{lichChieu.phim?.ten_phim || "Không xác định"}</td>
                    </tr>
                    <tr>
                        <th>Phòng chiếu</th>
                        <td>{lichChieu.phong?.ten_phong || "Không xác định"}</td>
                    </tr>
                    <tr>
                        <th>Phiên bản</th>
                        <td>{lichChieu.phien_ban?.the_loai || "Không xác định"}</td>
                    </tr>
                    <tr>
                        <th>Giá vé</th>
                        <td>
                            {lichChieu.gia_ve?.gia_ve
                                ? parseFloat(lichChieu.gia_ve.gia_ve).toLocaleString("vi-VN") + " ₫"
                                : "Không xác định"}
                        </td>
                    </tr>
                    <tr>
                        <th>Giờ chiếu</th>
                        <td>{new Date(lichChieu.gio_chieu).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <th>Giờ kết thúc</th>
                        <td>{new Date(lichChieu.gio_ket_thuc).toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>

            <button
                className="btn btn-secondary mt-3"
                onClick={() => navigate(-1)}
            >
                ⬅ Quay lại
            </button>
        </div>
    );
}
