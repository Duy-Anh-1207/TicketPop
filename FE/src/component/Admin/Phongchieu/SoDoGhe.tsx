import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import axios from "axios";

interface SoDoGheProps {
  open: boolean;
  onClose: () => void;
  id: number;
}

const SoDoGhe: React.FC<SoDoGheProps> = ({ open, onClose, id }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/ghe/${id}`);
        setData(res.data.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu ghế:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const hangList = data.reduce((acc, ghe) => {
    acc[ghe.hang] = acc[ghe.hang] || [];
    acc[ghe.hang].push(ghe);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="100%"
     style={{ maxWidth: 1030 }}
      title="Sơ đồ ghế"
    >
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div style={{ textAlign: "center" }}>
          {Object.keys(hangList).map((hang) => (
            <div key={hang} style={{ marginBottom: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 5,
                }}
              >
                {hangList[hang]
                  .sort((a: any, b: any) => a.cot - b.cot)
                  .map((ghe: any) => (
                    <div
                      key={ghe.id}
                      style={{
                        width: 40,
                        height: 40,
                        lineHeight: "40px",
                        border:
                          ghe.loai_ghe_id === 2
                            ? "2px solid blue"
                            : "1px solid #555",
                        borderRadius: 6,
                        background: "#fff",
                        color: "#000",
                        fontWeight: "bold",
                      }}
                    >
                      {ghe.so_ghe}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default SoDoGhe;
