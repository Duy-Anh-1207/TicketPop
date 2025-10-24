import { useNavigate } from "react-router-dom";
import { useListTinTuc, useDeleteTinTuc } from "../../../hook/TinTucHook";
import type { TinTuc } from "../../../types/tin-tuc";

export default function TinTucList() {
  const navigate = useNavigate();
  const { data: tinTucList, isLoading } = useListTinTuc();
  const deleteTinTuc = useDeleteTinTuc();

  if (isLoading) return <p className="text-center">Đang tải danh sách...</p>;

  return (
    <div className="container p-4">
      <div className="mb-3">
        <button
          onClick={() => navigate(`/admin/tin-tuc/them-moi`)}
          className="btn btn-success rounded"
        >
          Thêm tin tức
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered mx-auto">
          <thead className="table-light">
            <tr>
              <th className="text-center">Tiêu đề</th>
              <th className="text-center">Nội dung</th>
              <th className="text-center">Hình ảnh</th>
              <th className="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {tinTucList?.data?.map((tinTuc: TinTuc) => (
              <tr key={tinTuc.id}>
                <td className="text-center">{tinTuc.tieu_de}</td>
                <td className="text-center">
                  {(() => {
                    const textOnly = tinTuc.noi_dung.replace(/<[^>]+>/g, "");

                    return textOnly.length > 50
                      ? `${textOnly.substring(0, 50)}...`
                      : textOnly;
                  })()}
                </td>

                <td className="text-center">
                  {tinTuc.hinh_anh ? (
                    <img
                      src={`http://localhost:8000${tinTuc.hinh_anh}`}
                      alt={tinTuc.tieu_de}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    "Không có"
                  )}
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
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() =>
                            navigate(`/admin/tin-tuc/${tinTuc.id}`)
                          }
                        >
                          Xem chi tiết
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => deleteTinTuc.mutate(tinTuc.id)}
                        >
                          Xóa
                        </button>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
