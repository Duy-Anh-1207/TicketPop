import { Table, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getDanhSachDatVe } from "../../../provider/DonVeProvider";

const ListDonVe = () => {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["don-ve"],
    queryFn: async () => {
      const res = await getDanhSachDatVe();
      return res.data; // API trả về { message, data }
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
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/admin/ve/${record.ma_don_hang}`)}
        >
          Xem chi tiết
        </button>
      ),

    },
  ];

  if (isLoading) return <Spin size="large" />;

  if (error) return <p>Đã xảy ra lỗi khi tải dữ liệu.</p>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Danh sách đơn vé</h2>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="ma_don_hang"
        bordered
      />
    </div>
  );
};

export default ListDonVe;
