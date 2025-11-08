import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useListPhim, useDeletePhim } from "../../../hook/PhimHook";
import { useListTheLoai } from "../../../hook/TheLoaiHook";
import { useListPhienBan } from "../../../hook/PhienBanHook";
import { canAccess } from "../../../utils/permissions";

const MENU_ID = 1; // menu_id cho Quản lý Phim trong DB

const DanhSachPhimTable = () => {
  const navigate = useNavigate();

  const { data: phims, isLoading } = useListPhim({});
  const { data: theloais, isLoading: loadingTheLoai } = useListTheLoai();
  const { data: phienbans, isLoading: loadingPhienBan } = useListPhienBan();
  const deletePhimMutation = useDeletePhim({});

  const handleAdd = () => navigate("/admin/phim/create");
  const handleEdit = (id: number | string) => navigate(`/admin/phim/edit/${id}`);
  const handleDelete = (id: number | string) => {
    Swal.fire({
      title: "Bạn có chắc muốn xóa phim này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) deletePhimMutation.mutate(id);
    });
  };

  if (isLoading || loadingTheLoai || loadingPhienBan)
    return <p>Đang tải dữ liệu...</p>;

  // Quyền thao tác
  const canCreate = canAccess(MENU_ID, 1);
  const canEdit = canAccess(MENU_ID, 2);
  const canDeletePerm = canAccess(MENU_ID, 3);

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>🎬 Danh sách phim</h2>
        {canCreate && (
          <button className="btn btn-primary" onClick={handleAdd}>
            ➕ Thêm phim
          </button>
        )}
      </div>

      {phims && phims.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered table-hover text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Tên phim</th>
                <th>Ảnh poster</th>
                <th>Thể loại</th>
                <th>Phiên bản</th>
                <th>Thời lượng</th>
                <th>Ngày công chiếu</th>
                <th>Ngày kết thúc</th>
                <th>Mô tả</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {phims.map((phim: any, index: number) => {
                const theLoaiIds: number[] = Array.isArray(phim.the_loai_id)
                  ? phim.the_loai_id.map(Number)
                  : JSON.parse(phim.the_loai_id || "[]").map(Number);

                const phienBanIds: number[] = Array.isArray(phim.phien_ban_id)
                  ? phim.phien_ban_id.map(Number)
                  : JSON.parse(phim.phien_ban_id || "[]").map(Number);

                const theLoaiNames = theLoaiIds
                  .map(
                    (id) =>
                      theloais?.find((tl: any) => tl.id === id)?.ten_the_loai
                  )
                  .filter(Boolean)
                  .join(", ");

                const phienBanNames = phienBanIds
                  .map(
                    (id) =>
                      phienbans?.find((pb: any) => pb.id === id)?.the_loai
                  )
                  .filter(Boolean)
                  .join(", ");

                const imageUrl = phim.anh_poster
                  ? phim.anh_poster.startsWith("http")
                    ? phim.anh_poster
                    : `${import.meta.env.VITE_API_BASE_URL}/storage/${phim.anh_poster.replace("posters/", "posters/")}`
                  : null;


                return (
                  <tr key={phim.id}>
                    <td>{index + 1}</td>
                    <td className="fw-semibold">{phim.ten_phim}</td>
                    <td>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="poster"
                          className="img-thumbnail"
                          style={{
                            width: 80,
                            height: 110,
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{theLoaiNames || "Không xác định"}</td>
                    <td>{phienBanNames || "Không xác định"}</td>
                    <td>
                      {phim.thoi_luong ? `${phim.thoi_luong} phút` : "—"}
                    </td>
                    <td>
                      {phim.ngay_cong_chieu
                        ? new Date(phim.ngay_cong_chieu).toLocaleDateString(
                          "vi-VN"
                        )
                        : "—"}
                    </td>
                    <td>
                      {phim.ngay_ket_thuc
                        ? new Date(phim.ngay_ket_thuc).toLocaleDateString(
                          "vi-VN"
                        )
                        : "—"}
                    </td>
                    <td
                      style={{
                        maxWidth: 250,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={phim.mo_ta}
                    >
                      {phim.mo_ta || "—"}
                    </td>
                    <td className="d-flex justify-content-center gap-2">
                      {canEdit && (
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => handleEdit(phim.id)}
                        >
                          Sửa
                        </button>
                      )}
                      {canDeletePerm && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(phim.id)}
                        >
                          Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Chưa có phim nào.</p>
      )}
    </div>
  );
};

export default DanhSachPhimTable;
