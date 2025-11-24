import { useParams, useNavigate } from "react-router-dom";
import { Descriptions, Table, Spin, Button, Image } from "antd";
import { useChiTietDonVeTheoMaGD } from "../../../hook/DonVeHook";


const ChiTietDonVe = () => {
  const { maGiaoDich } = useParams(); 
  const navigate = useNavigate();

  const { data: payload, isLoading, error } = useChiTietDonVeTheoMaGD(maGiaoDich);

  if (isLoading) return <Spin size="large" />;
  if (error) return <p>Đã xảy ra lỗi khi tải chi tiết vé.</p>;
  if (!payload) return <p>Không tìm thấy vé này.</p>;

  // Danh sách ghế
  const danhSachGhe = payload.danh_sach_ghe?.map((item: any, index: number) => ({
    key: index,
    so_ghe: item.so_ghe,
    loai_ghe: item.loai_ghe,
    gia_ve: item.gia_ve,
  }));

  // Danh sách đồ ăn
  const danhSachDoAn = payload.do_an?.map((item: any, index: number) => ({
    key: index,
    ten_do_an: item.ten_do_an,
    anh_do_an: item.anh_do_an,
    gia_ban: item.gia_ban,
    quantity: item.quantity,
  }));

  return (
    <div style={{ padding: 24 }}>
      <Button style={{ marginBottom: 16 }} onClick={() => navigate(-1)}>
        Quay lại
      </Button>

      <h2>Chi tiết vé: {payload.ma_don_hang}</h2>

      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="Tên khách hàng">{payload.khach_hang?.ten}</Descriptions.Item>
        <Descriptions.Item label="Email">{payload.khach_hang?.email}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{payload.khach_hang?.so_dien_thoai}</Descriptions.Item>
        <Descriptions.Item label="Phim">{payload.phim?.ten_phim}</Descriptions.Item>
        <Descriptions.Item label="Poster">
          {payload.phim?.poster && <Image src={payload.phim.poster} width={100} />}
        </Descriptions.Item>
        <Descriptions.Item label="Phòng">{payload.phong}</Descriptions.Item>
        <Descriptions.Item label="Suất chiếu">
          {payload.gio_chieu} - {payload.gio_ket_thuc}
        </Descriptions.Item>
        <Descriptions.Item label="Tổng tiền">
          {Number(payload.tong_tien).toLocaleString("vi-VN") + " đ"}
        </Descriptions.Item>
      </Descriptions>

      <h3 style={{ marginTop: 24 }}>Danh sách ghế</h3>
      <Table dataSource={danhSachGhe} columns={[
        { title: "Số ghế", dataIndex: "so_ghe", key: "so_ghe" },
        { title: "Loại ghế", dataIndex: "loai_ghe", key: "loai_ghe" },
        { title: "Giá vé", dataIndex: "gia_ve", key: "gia_ve", render: (v) => Number(v).toLocaleString("vi-VN") + " đ" },
      ]} pagination={false} />

      <h3 style={{ marginTop: 24 }}>Đồ ăn kèm</h3>
      <Table dataSource={danhSachDoAn} columns={[
        { title: "Ảnh", dataIndex: "anh_do_an", key: "anh_do_an", render: (src: string) => src && <Image src={src} width={50} /> },
        { title: "Tên đồ ăn", dataIndex: "ten_do_an", key: "ten_do_an" },
        { title: "Giá bán", dataIndex: "gia_ban", key: "gia_ban", render: (v) => Number(v).toLocaleString("vi-VN") + " đ" },
        { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
      ]} pagination={false} />
    </div>
  );
};


export default ChiTietDonVe;
