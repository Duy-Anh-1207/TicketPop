import { useListBanners, useUpdateBanner, useDeleteBanner } from "../../../hook/BannerHook";
import Swal from "sweetalert2";
import type { Banner } from "../../../types/banner";

export default function BannerList() {
  const { data: banners, isLoading } = useListBanners();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();

  if (isLoading) return <p className="text-center mt-4">Đang tải danh sách banner...</p>;

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Xác nhận xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBanner.mutate(id, {
          onSuccess: () => Swal.fire("✅ Đã xóa banner!", "", "success"),
        });
      }
    });
  };

  const handleEdit = (banner: Banner) => {
  Swal.fire({
    title: "✏️ Sửa thông tin banner",
    html: `
      <div class="text-start">
        <label class="form-label">Tiêu đề</label>
        <input id="title" class="form-control mb-2" value="${banner.title}" />

        <label class="form-label">Link</label>
        <input id="link_url" class="form-control mb-2" value="${banner.link_url ?? ''}" />

        <label class="form-label">Ngày bắt đầu</label>
        <input id="start_date" type="date" class="form-control mb-2"
               value="${banner.start_date ? banner.start_date.split('T')[0] : ''}" />

        <label class="form-label">Ngày kết thúc</label>
        <input id="end_date" type="date" class="form-control mb-2"
               value="${banner.end_date ? banner.end_date.split('T')[0] : ''}" />

        <label class="form-label">Ảnh</label>
        <input id="image" type="file" class="form-control mb-2" />
        <img src="${banner.image_url}" alt="preview" style="max-width:100%;border-radius:8px;margin-top:8px"/>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Lưu thay đổi",
    cancelButtonText: "Hủy",
    preConfirm: () => {
      const title = (document.getElementById("title") as HTMLInputElement)?.value;
      const link_url = (document.getElementById("link_url") as HTMLInputElement)?.value;
      const start_date = (document.getElementById("start_date") as HTMLInputElement)?.value;
      const end_date = (document.getElementById("end_date") as HTMLInputElement)?.value;
      const image = (document.getElementById("image") as HTMLInputElement)?.files?.[0];

      if (!title.trim()) {
        Swal.showValidationMessage("Tiêu đề không được để trống");
        return false;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("link_url", link_url);
      formData.append("start_date", start_date);
      formData.append("end_date", end_date);
      if (image) formData.append("image_url", image);

      return formData;
    },
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      updateBanner.mutate(
        { id: banner.id, values: result.value },
        {
          onSuccess: () => Swal.fire("✅ Cập nhật thành công!", "", "success"),
          onError: () => Swal.fire("❌ Cập nhật thất bại!", "", "error"),
        }
      );
    }
  });
};


  return (
    <div className="container p-4">
      <h4 className="mb-4 text-center">🖼️ Quản lý Banner</h4>

      <div className="table-responsive">
        <table className="table table-bordered table-striped mx-auto align-middle">
          <thead className="table-light text-center">
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Ảnh</th>
              <th>Link</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {banners?.length ? (
              banners.map((banner: Banner) => (
                <tr key={banner.id}>
                  <td className="text-center">{banner.id}</td>
                  <td>{banner.title}</td>
                  <td className="text-center">
                    <img
                      src={`http://127.0.0.1:8000${banner.image_url}`}
                      alt={banner.title}
                      className="rounded"
                      style={{ width: "120px", height: "60px", objectFit: "cover" }}
                    />
                  </td>
                  <td>
                    <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
                      {banner.link_url}
                    </a>
                  </td>
                  <td className="text-center">
                    {new Date(banner.start_date).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="text-center">
                    {new Date(banner.end_date).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="text-center">
                    <div className="btn-group">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleEdit(banner)}
                      >
                        Cập nhật
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(banner.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center text-muted py-3">
                  Không có banner nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
