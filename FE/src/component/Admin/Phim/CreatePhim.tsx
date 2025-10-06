import React, { useState, useEffect } from "react";

interface ModalFormProps {
  phim?: any;
  onSubmit: (values: any) => void;
  onClose: () => void;
}

const CreatePhim: React.FC<ModalFormProps> = ({ phim, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<any>({
    ten_phim: "",
    anh_poster: "",
    the_loai: "",
    loai_suat_chieu: "",
    thoi_luong: "",
    ngay_cong_chieu: "",
    ngay_ket_thuc: "",
  });

  useEffect(() => {
    if (phim) {
      setFormData(phim);
    }
  }, [phim]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-lg font-bold mb-4">{phim ? "Sửa phim" : "Thêm phim"}</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Tên phim"
            value={formData.ten_phim || ""}
            onChange={(e) => setFormData({ ...formData, ten_phim: e.target.value })}
            className="border px-3 py-1 rounded"
            required
          />
          <input
            type="text"
            placeholder="Ảnh poster"
            value={formData.anh_poster || ""}
            onChange={(e) => setFormData({ ...formData, anh_poster: e.target.value })}
            className="border px-3 py-1 rounded"
          />
          <input
            type="text"
            placeholder="Thể loại"
            value={formData.the_loai || ""}
            onChange={(e) => setFormData({ ...formData, the_loai: e.target.value })}
            className="border px-3 py-1 rounded"
          />
          <input
            type="text"
            placeholder="Loại suất chiếu"
            value={formData.loai_suat_chieu || ""}
            onChange={(e) => setFormData({ ...formData, loai_suat_chieu: e.target.value })}
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
            placeholder="Ngày công chiếu"
            value={formData.ngay_cong_chieu || ""}
            onChange={(e) => setFormData({ ...formData, ngay_cong_chieu: e.target.value })}
            className="border px-3 py-1 rounded"
          />
          <input
            type="date"
            placeholder="Ngày kết thúc"
            value={formData.ngay_ket_thuc || ""}
            onChange={(e) => setFormData({ ...formData, ngay_ket_thuc: e.target.value })}
            className="border px-3 py-1 rounded"
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1 rounded border hover:bg-gray-100"
            >
              Hủy
            </button>
            <button type="submit" className="px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600">
              {phim ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePhim;
