import { useParams, useNavigate } from "react-router-dom";
import { Descriptions, Table, Spin, Button, Image, message, Tag } from "antd";
import { useChiTietDonVeTheoMaGD } from "../../../hook/DonVeHook";
import VeRap from "./VeRap";
import { capNhatTrangThaiTheoMaGD } from "../../../provider/DonVeProvider"; // API PUT
import VeDoAn from "./VeDoAn";

const ChiTietDonVeRap = () => {
  const { maGiaoDich } = useParams();
  const navigate = useNavigate();

  const { data: payload, isLoading, error, refetch } = useChiTietDonVeTheoMaGD(maGiaoDich);

  if (isLoading) return <Spin size="large" />;
  if (error) return <p>Đã xảy ra lỗi khi tải chi tiết vé.</p>;
  if (!payload) return <p>Không tìm thấy vé này.</p>;

  const danhSachGhe = payload.danh_sach_ghe || [];
  const danhSachDoAn = payload.do_an || [];

  // ======================== In PDF tất cả vé + tự động cập nhật trạng thái ========================
  const handleInVeRap = () => {
    const el = document.getElementById("print-area") as HTMLElement;
    if (!el) return message.error("Không tìm thấy nội dung để in");

    const newWindow = window.open("", "_blank", "width=800,height=600");
    if (!newWindow) return;

    newWindow.document.write("<html><head><title>In vé</title></head><body>");
    newWindow.document.write(el.innerHTML);
    newWindow.document.write("</body></html>");
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
  };

  const handleCapNhatTrangThai = async () => {
    try {
      await capNhatTrangThaiTheoMaGD(payload.ma_don_hang);
      message.success("Đã chuyển trạng thái 'Đã in' cho tất cả vé trong mã giao dịch");
      refetch();
    } catch (err) {
      console.error(err);
      message.error("Cập nhật trạng thái thất bại");
    }
  };


  return (
    <div style={{ padding: 24 }}>
      <Button style={{ marginBottom: 16, marginRight: 8 }} onClick={() => navigate(-1)}>
        Quay lại
      </Button>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={handleInVeRap}>
        In vé rạp (PDF)
      </Button>
      <Button type="default" style={{ marginBottom: 16, marginLeft: 8 }} onClick={handleCapNhatTrangThai}>
        Chuyển trạng thái đã in
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
        <Descriptions.Item label="Trạng thái vé">
          {payload.da_quet ? (
            <Tag color="green">Đã in</Tag>
          ) : (
            <Tag color="red">Chưa in</Tag>
          )}
        </Descriptions.Item>

      </Descriptions>

      <h3 style={{ marginTop: 24 }}>Danh sách ghế</h3>
      <Table
        dataSource={danhSachGhe.map((item: any, index: number) => ({ key: index, ...item }))}
        columns={[
          { title: "Số ghế", dataIndex: "so_ghe", key: "so_ghe" },
          { title: "Loại ghế", dataIndex: "loai_ghe", key: "loai_ghe" },
          {
            title: "Giá vé",
            dataIndex: "gia_ve",
            key: "gia_ve",
            render: (v) => Number(v).toLocaleString("vi-VN") + " đ",
          },
        ]}
        pagination={false}
      />

      {danhSachDoAn.length > 0 && (
        <>
          <h3 style={{ marginTop: 24 }}>Đồ ăn kèm</h3>
          <Table
            dataSource={danhSachDoAn.map((item: any, index: number) => ({ key: index, ...item }))}
            columns={[
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
                render: (v) => Number(v).toLocaleString("vi-VN") + " đ",
              },
              { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
            ]}
            pagination={false}
          />
        </>
      )}

      <div id="print-area" style={{ display: "none" }}>
        {/* Vé xem phim */}
        {danhSachGhe.map((ghe: any, index: number) => (
          <VeRap
            key={index}
            maDonHang={payload.ma_don_hang}
            khachHang={payload.khach_hang}
            phim={payload.phim}
            phong={payload.phong}
            gioChieu={`${payload.gio_chieu} - ${payload.gio_ket_thuc}`}
            ghe={ghe}
          />
        ))}

        {/* Vé combo đồ ăn */}
        {danhSachDoAn.length > 0 && (
          <VeDoAn
            maDonHang={payload.ma_don_hang}
            items={danhSachDoAn} // truyền nguyên danh sách
          />
        )}

      </div>


    </div>
  );
};

export default ChiTietDonVeRap;
