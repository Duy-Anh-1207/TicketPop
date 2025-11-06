  // import { useState } from "react";
  import { useNavigate } from "react-router-dom";
  import Swal from "sweetalert2";
  import { useListLichChieu } from "../../../hook/useLichChieu";
  import type { LichChieu } from "../../../types/lichchieu";
  import axios from "axios";
  
  // import { useListPhim } from "../../../hook/PhimHook";
  // import { useListPhongChieuTH0 } from "../../../hook/PhongChieuHook";

  export default function LichChieuList() {
    const navigate = useNavigate();
    const { data: lichChieuList, isLoading , refetch } = useListLichChieu();
    // const { data: phimList } = useListPhim({});
    // const { data: phongList } = useListPhongChieuTH0();
      // ✅ Hàm xóa mềm lịch chiếu
 // 🗑️ Xóa mềm (đưa vào thùng rác)
  const handleDelete = async (id: number) => {
  const result = await Swal.fire({
    title: "Bạn có chắc muốn xóa?",
    text: "Lịch chiếu sẽ được đưa vào thùng rác.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy",
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#f37b63",
  });

  if (result.isConfirmed) {
    Swal.fire({
      title: "Đang xóa...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // ✅ Dùng đúng endpoint bạn test thành công
      const response = await axios.delete(
        `http://127.0.0.1:8000/api/lich-chieu/${id}`
      );

      Swal.fire("🎉 Thành công", response.data.message, "success");
      refetch(); // reload lại danh sách
    } catch (error: any) {
      console.error("Lỗi khi xóa lịch chiếu:", error.response || error);
      Swal.fire(
        "Lỗi",
        error.response?.data?.message || "Không thể xóa lịch chiếu!",
        "error"
      );
    }
  }
};

    if (isLoading) return <p className="text-center">Đang tải danh sách...</p>;

    return (
      <div className="container p-4">
        <div className="mb-3">
          <button
            onClick={() => navigate(`/admin/lich-chieu/them-moi`)}
            className="btn btn-success rounded"
          >
            Thêm lịch chiếu
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered mx-auto">
            <thead className="table-light">
              <tr>
                <th className="text-center">ID</th>
                <th className="text-center">Phim</th>
                <th className="text-center">Phòng chiếu</th>
                <th className="text-center">Phiên bản</th>
                <th className="text-center">Giờ chiếu</th>
                <th className="text-center">Giờ kết thúc</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {lichChieuList?.map((lichChieu: LichChieu) => {
                const phimName = lichChieu.phim?.ten_phim || "Không xác định";
const phongName = lichChieu.phong?.ten_phong || "Không xác định";
const phienBanName = lichChieu.phien_ban?.the_loai || "Không có phiên bản";

                return (
                  <tr key={lichChieu.id}>
                    <td className="text-center">{lichChieu.id}</td>
                    <td className="text-center">{phimName}</td>
                    <td className="text-center">{phongName}</td>
                    <td className="text-center">{phienBanName}</td>
                    <td className="text-center">
                      {new Date(lichChieu.gio_chieu).toLocaleString()}
                    </td>
                    <td className="text-center">
                      {new Date(lichChieu.gio_ket_thuc).toLocaleString()}
                    </td>
                    <td className="text-center">
                      <div className="dropup position-static">
                        <button
                          className="btn btn-outline-secondary btn-sm rounded"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i className="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                        <ul className="dropdown-menu" style={{ minWidth: "220px" }}>
                          {/* Xem chi tiết */}
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => navigate(`/admin/lich-chieu/${lichChieu.id}`)}
                            >
                              Xem chi tiết
                            </button>
                             <button
      className="btn btn-outline-danger btn-sm"
      onClick={() => handleDelete(lichChieu.id)} // ✅ Gọi hàm xóa ở đây
    >
      ❌ Xóa
    </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }