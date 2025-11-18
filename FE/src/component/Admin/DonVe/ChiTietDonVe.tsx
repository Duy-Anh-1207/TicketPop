import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Descriptions, Table, Spin, Button, Image } from "antd";
import { getChiTietVe } from "../../../provider/DonVeProvider";

const ChiTietDonVe = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["don-ve", id],
    queryFn: async () => {
      const res = await getChiTietVe(id!);
      return res.data; // API trả về { message, data }
    },
    enabled: !!id,
  });

  if (isLoading) return <Spin size="large" />;
  if (error) return <p>Đã xảy ra lỗi khi tải chi tiết vé.</p>;
  if (!data) return <p>Không tìm thấy vé này.</p>;

  // Danh sách ghế
  const danhSachGhe = data.chi_tiet?.map((item: any, index: number) => ({
    key: index,
    so_ghe: item.ghe?.so_ghe,
    loai_ghe: item.ghe?.loai_ghe?.ten_loai_ghe,
    gia_ve: item.gia_ve,
  }));

  const columnsGhe = [
    { title: "Số ghế", dataIndex: "so_ghe", key: "so_ghe" },
    { title: "Loại ghế", dataIndex: "loai_ghe", key: "loai_ghe" },
    {
      title: "Giá vé",
      dataIndex: "gia_ve",
      key: "gia_ve",
      render: (value: any) => Number(value).toLocaleString("vi-VN") + " đ",
    },
  ];

  // Danh sách đồ ăn
  const danhSachDoAn = data.do_an?.map((item: any, index: number) => ({
    key: index,
    ten_do_an: item.ten_do_an,
    anh_do_an: item.anh_do_an,
    gia_ban: item.gia_ban,
    quantity: item.quantity,
  }));

  const columnsDoAn = [
    {
      title: "Ảnh",
      dataIndex: "anh_do_an",
      key: "anh_do_an",
      render: (src: string) => src && <Image src={src} width={50} />,
    },
    { title: "Tên đồ ăn", dataIndex: "ten_do_an", key: "ten_do_an" },
    {
      title: "Giá bán",
      dataIndex: "gia_ban",
      key: "gia_ban",
      render: (value: any) => Number(value).toLocaleString("vi-VN") + " đ",
    },
    { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Button style={{ marginBottom: 16 }} onClick={() => navigate(-1)}>
        Quay lại
      </Button>

      <h2>Chi tiết vé: {data.id}</h2>

      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="Tên khách hàng">{data.nguoi_dung?.ten}</Descriptions.Item>
        <Descriptions.Item label="Email">{data.nguoi_dung?.email}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{data.nguoi_dung?.so_dien_thoai}</Descriptions.Item>
        <Descriptions.Item label="Phim">{data.lich_chieu?.phim?.ten_phim}</Descriptions.Item>
        <Descriptions.Item label="Poster">
          {data.lich_chieu?.phim?.anh_poster && <Image src={data.lich_chieu.phim.anh_poster} width={100} />}
        </Descriptions.Item>
        <Descriptions.Item label="Phòng">{data.lich_chieu?.phong?.ten_phong}</Descriptions.Item>
        <Descriptions.Item label="Suất chiếu">
          {data.lich_chieu?.gio_chieu} - {data.lich_chieu?.gio_ket_thuc}
        </Descriptions.Item>
        <Descriptions.Item label="Tổng tiền">{Number(data.tong_tien).toLocaleString("vi-VN") + " đ"}</Descriptions.Item>
      </Descriptions>

      <h3 style={{ marginTop: 24 }}>Danh sách ghế</h3>
      <Table dataSource={danhSachGhe} columns={columnsGhe} pagination={false} />

      <h3 style={{ marginTop: 24 }}>Đồ ăn kèm</h3>
      <Table dataSource={danhSachDoAn} columns={columnsDoAn} pagination={false} />
    </div>
  );
};

export default ChiTietDonVe;
