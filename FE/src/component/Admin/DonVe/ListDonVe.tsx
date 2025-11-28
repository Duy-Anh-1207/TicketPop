import { Table, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getDanhSachDatVe } from "../../../provider/DonVeProvider";
import { useState } from "react";
import { useListPhim } from "../../../hook/PhimHook"; 

const ListDonVe = () => {
  const navigate = useNavigate();

  const [filterDate, setFilterDate] = useState("");
  const [filterPhim, setFilterPhim] = useState("");

  const { data: movies } = useListPhim({});

  const { data, isLoading, error } = useQuery({
    queryKey: ["don-ve", filterDate, filterPhim],
    queryFn: async () => {
      const params = {
        date: filterDate,
        phim_id: filterPhim
      };
      const res = await getDanhSachDatVe(params);
      return res.data; 
    },
  });

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "ma_don_hang",
      key: "ma_don_hang",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phim",
      dataIndex: "phim",
      key: "phim",
    },
    {
      title: "Ngày đặt",
      dataIndex: "ngay_dat",
      key: "ngay_dat",
    },
    {
      title: "Thanh toán",
      dataIndex: "thanh_toan",
      key: "thanh_toan",
    },
    {
      title: "Tổng tiền",
      dataIndex: "tong_tien",
      key: "tong_tien",
      className: "text-end fw-bold text-danger"
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate(`/admin/ve/${record.ma_don_hang}`)}
        >
          Xem chi tiết
        </button>
      ),
    },
  ];

  return (
    <div className="container p-4">
      <h2 className="mb-4">🎟️ Quản lý đơn vé</h2>

      <div className="card p-3 mb-4 shadow-sm border-0 bg-light">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label fw-bold">Lọc theo phim</label>
            <select 
              className="form-select"
              value={filterPhim}
              onChange={(e) => setFilterPhim(e.target.value)}
            >
              <option value="">-- Tất cả phim --</option>
              {movies?.map((m: any) => (
                <option key={m.id} value={m.id}>{m.ten_phim}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-bold">Lọc theo ngày đặt</label>
            <input 
              type="date" 
              className="form-control"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <button 
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setFilterDate("");
                setFilterPhim("");
              }}
            >
              <i className="fa-solid fa-rotate-right me-2"></i> Đặt lại
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
           <Spin size="large" />
        </div>
      ) : error ? (
        <div className="alert alert-danger">Đã xảy ra lỗi khi tải dữ liệu.</div>
      ) : (
        <Table
          dataSource={data}
          columns={columns}
          rowKey="ma_don_hang"
          bordered
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
};

export default ListDonVe;