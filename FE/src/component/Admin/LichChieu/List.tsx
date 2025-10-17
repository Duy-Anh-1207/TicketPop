// import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListLichChieu } from "../../../hook/useLichChieu";
import type { LichChieu } from "../../../types/lichchieu";
import { useListPhim } from "../../../hook/PhimHook";
import { useListPhongChieuTH0 } from "../../../hook/PhongChieuHook";

export default function LichChieuList() {
  const navigate = useNavigate();
  const { data: lichChieuList, isLoading } = useListLichChieu();
  const { data: phimList } = useListPhim({});
  const { data: phongList } = useListPhongChieuTH0();

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
              const phimName =
                phimList?.find((p: any) => p.id === lichChieu.phim_id)?.ten_phim ||
                "Không xác định";
              const phongName =
                phongList?.find((p: any) => p.id === lichChieu.phong_id)?.ten_phong ||
                "Không xác định";
              const phienBanName =
                lichChieu.phienBan?.ten_phien_ban || "Không có phiên bản";

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