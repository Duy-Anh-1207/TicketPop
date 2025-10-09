import React, { useState, useEffect } from "react";

interface ModalFormProps {
  phim?: any;
  onSubmit: (values: any) => void;
  onClose: () => void;
}

const CreatePhim: React.FC<ModalFormProps> = ({ phim, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<any>({
    ten_phim: "",
    mo_ta: "",
    thoi_luong: "",
    trailer: "",
    ngon_ngu: "",
    quoc_gia: "",
    anh_poster: "",
    ngay_cong_chieu: "",
    ngay_ket_thuc: "",
    do_tuoi_gioi_han: "",
    loai_suat_chieu: "",
    phien_ban_id: "",
    the_loai_id: "",
  });

  const danhSachTheLoai = [
    { id: 1, ten_the_loai: "Hành động" },
    { id: 2, ten_the_loai: "Hài" },
    { id: 3, ten_the_loai: "Tình cảm" },
    { id: 4, ten_the_loai: "Kinh dị" },
    { id: 5, ten_the_loai: "Hoạt hình" },
  ];

  const danhSachPhienBan = [
    { id: 1, ten_phien_ban: "2D" },
    { id: 2, ten_phien_ban: "3D" },
  ];

  const danhSachLoaiSuat = ["Thường", "Đặc biệt", "Sớm"];

  useEffect(() => {
    if (phim) {
      setFormData(phim);
    }
  }, [phim]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[450px] max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">
          {phim ? "Sửa phim" : "Thêm phim"}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          <input
            type="text"
            placeholder="Tên phim"
            value={formData.ten_phim || ""}
            onChange={(e) => setFormData({ ...formData, ten_phim: e.target.value })}
            className="border px-3 py-1 rounded"
            required
          />

          <textarea
            placeholder="Mô tả phim"
            value={formData.mo_ta || ""}
            onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
            className="border px-3 py-1 rounded"
          />

          <input
            type="text"
            placeholder="Link trailer"
            value={formData.trailer || ""}
            onChange={(e) => setFormData({ ...formData, trailer: e.target.value })}
            className="border px-3 py-1 rounded"
          />

          <input
            type="text"
            placeholder="Ngôn ngữ"
            value={formData.ngon_ngu || ""}
            onChange={(e) => setFormData({ ...formData, ngon_ngu: e.target.value })}
            className="border px-3 py-1 rounded"
          />

          <input
            type="text"
            placeholder="Quốc gia"
            value={formData.quoc_gia || ""}
            onChange={(e) => setFormData({ ...formData, quoc_gia: e.target.value })}
            className="border px-3 py-1 rounded"
          />

          <input
            type="text"
            placeholder="Ảnh poster (URL)"
            value={formData.anh_poster || ""}
            onChange={(e) => setFormData({ ...formData, anh_poster: e.target.value })}
            className="border px-3 py-1 rounded"
          />

          <input
            type="number"
            placeholder="Thời lượng (phút)"
            value={formData.thoi_luong || ""}
            onChange={(e) => setFormData({ ...formData, thoi_luong: Number(e.target.value) })}
            className="border px-3 py-1 rounded"
          />

          <input
            type="date"
            value={formData.ngay_cong_chieu || ""}
            onChange={(e) => setFormData({ ...formData, ngay_cong_chieu: e.target.value })}
            className="border px-3 py-1 rounded"
          />

          <input
            type="date"
            value={formData.ngay_ket_thuc || ""}
            onChange={(e) => setFormData({ ...formData, ngay_ket_thuc: e.target.value })}
            className="border px-3 py-1 rounded"
          />

          <input
            type="text"
            placeholder="Độ tuổi giới hạn (VD: 13+)"
            value={formData.do_tuoi_gioi_han || ""}
            onChange={(e) => setFormData({ ...formData, do_tuoi_gioi_han: e.target.value })}
            className="border px-3 py-1 rounded"
          />

          <select
            value={formData.loai_suat_chieu || ""}
            onChange={(e) => setFormData({ ...formData, loai_suat_chieu: e.target.value })}
            className="border px-3 py-1 rounded"
            required
          >
            <option value="">-- Chọn loại suất chiếu --</option>
            {danhSachLoaiSuat.map((item, index) => (
              <option key={index} value={item}>{item}</option>
            ))}
          </select>

          <select
            value={formData.phien_ban_id || ""}
            onChange={(e) => setFormData({ ...formData, phien_ban_id: e.target.value })}
            className="border px-3 py-1 rounded"
            required
          >
            <option value="">-- Chọn phiên bản --</option>
            {danhSachPhienBan.map((pb) => (
              <option key={pb.id} value={pb.id}>{pb.ten_phien_ban}</option>
            ))}
          </select>

    
          <select
            value={formData.the_loai_id || ""}
            onChange={(e) => setFormData({ ...formData, the_loai_id: e.target.value })}
            className="border px-3 py-1 rounded"
            required
          >
            <option value="">-- Chọn thể loại --</option>
            {danhSachTheLoai.map((tl) => (
              <option key={tl.id} value={tl.id}>{tl.ten_the_loai}</option>
            ))}
          </select>

         
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1 rounded border hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              {phim ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePhim;
