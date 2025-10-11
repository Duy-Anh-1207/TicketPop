import { useState } from "react";
import Swal from "sweetalert2";
import {
  useListPhim,
  useDeletePhim,
  useCreatePhim,
  useUpdatePhim,
} from "../../hook/PhimHook";
import CreatePhim from "./CreatePhim";

const DanhSachPhimTable = () => {
  const { data: phims, isLoading } = useListPhim({});
  const deletePhimMutation = useDeletePhim({});
  const createPhimMutation = useCreatePhim({});
  const updatePhimMutation = useUpdatePhim({});

  const [showModal, setShowModal] = useState(false);
  const [selectedPhim, setSelectedPhim] = useState<any>(null);

  // Danh sách thể loại (đồng bộ với CreatePhim)
  const danhSachTheLoai = [
    { id: 1, ten_the_loai: "Hành động" },
    { id: 2, ten_the_loai: "Hài" },
    { id: 3, ten_the_loai: "Tình cảm" },
    { id: 4, ten_the_loai: "Kinh dị" },
    { id: 5, ten_the_loai: "Hoạt hình" },
  ];

  const handleAdd = () => {
    setSelectedPhim(null);
    setShowModal(true);
  };

  const handleEdit = (phim: any) => {
    setSelectedPhim(phim);
    setShowModal(true);
  };

  const handleDelete = (id: number | string) => {
    Swal.fire({
      title: "Bạn có chắc muốn xóa phim này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        deletePhimMutation.mutate(id);
      }
    });
  };

  const handleSubmitForm = (values: any) => {
    if (selectedPhim) {
      updatePhimMutation.mutate({ id: selectedPhim.id, values });
    } else {
      createPhimMutation.mutate(values);
    }
    setShowModal(false);
  };

  if (isLoading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">🎬 Danh sách phim</h2>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          onClick={handleAdd}
        >
          Thêm phim
        </button>
      </div>

      {phims && phims.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">#</th>
                <th className="border px-4 py-2">Tên phim</th>
                <th className="border px-4 py-2">Ảnh poster</th>
                <th className="border px-4 py-2">Thể loại</th>
                <th className="border px-4 py-2">Loại suất chiếu</th>
                <th className="border px-4 py-2">Thời lượng</th>
                <th className="border px-4 py-2">Ngày công chiếu</th>
                <th className="border px-4 py-2">Ngày kết thúc</th>
                <th className="border px-4 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {phims.map((phim: any, index: number) => {
                const theLoai = danhSachTheLoai.find(
                  (tl) => tl.id === Number(phim.the_loai_id)
                );

                return (
                  <tr key={phim.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{index + 1}</td>
                    <td className="border px-4 py-2 font-semibold">
                      {phim.ten_phim}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {phim.anh_poster ? (
                        <img
                          src={
                            phim.anh_poster?.startsWith("http")
                              ? phim.anh_poster
                              : `http://localhost:8000/storage/${phim.anh_poster}`
                          }
                          alt="poster"
                          className="w-20 h-28 object-cover rounded-lg shadow-md border mx-auto"
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="border px-4 py-2">
                      {theLoai ? theLoai.ten_the_loai : "Không xác định"}
                    </td>
                    <td className="border px-4 py-2">
                      {phim.loai_suat_chieu || "—"}
                    </td>
                    <td className="border px-4 py-2">
                      {typeof phim.thoi_luong === "number"
                        ? `${phim.thoi_luong} phút`
                        : "—"}
                    </td>
                    <td className="border px-4 py-2">
                      {phim.ngay_cong_chieu
                        ? new Date(phim.ngay_cong_chieu).toLocaleDateString(
                            "vi-VN"
                          )
                        : "—"}
                    </td>
                    <td className="border px-4 py-2">
                      {phim.ngay_ket_thuc
                        ? new Date(phim.ngay_ket_thuc).toLocaleDateString(
                            "vi-VN"
                          )
                        : "—"}
                    </td>
                    <td className="border px-4 py-2 flex gap-2 justify-center">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        onClick={() => handleEdit(phim)}
                      >
                        Sửa
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        onClick={() => handleDelete(phim.id)}
                      >
                        Xóa
                      </button>
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

      {showModal && (
        <CreatePhim
          phim={selectedPhim}
          onSubmit={handleSubmitForm}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default DanhSachPhimTable;
