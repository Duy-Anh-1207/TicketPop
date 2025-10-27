import type { VaiTro } from "../../../types/vaitro";
import Swal from "sweetalert2";
import { useListMenu } from "../../../hook/VaiTroHook";
import { useEffect, useState } from "react";
import axios from "axios";

// Các quyền ngang
const PERMISSIONS = [
  { id: 1, name: "Thêm" },
  { id: 2, name: "Sửa" },
  { id: 3, name: "Xóa" },
  { id: 4, name: "Xem" },
];

type Props = {
  role: VaiTro;
  onClose: () => void;
};

export default function RolePermissionModal({ role, onClose }: Props) {
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);
  const { data: MENUS, isLoading, isError } = useListMenu();

  // Load quyền hiện tại của role
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/quyen-truy-cap")
      .then((res) => {
        const allData = res.data.data; // lấy mảng data từ API
        const roleData = allData.filter(
          (item: any) => item.vai_tro_id === role.id
        );
        setRolePermissions(
          roleData.map((item: any) => ({
            menuId: item.menu_id,
            permissions: item.function.map(Number), // ["2"] -> [2]
          }))
        );
      })
      .catch((err) => console.error("Lỗi khi load quyền:", err));
  }, [role.id]);

  // Toggle checkbox
  const togglePermission = (menuId: number, action: number) => {
    setRolePermissions((prev) => {
      const index = prev.findIndex((item) => item.menuId === menuId);
      if (index !== -1) {
        const item = prev[index];
        const hasAction = item.permissions.includes(action);
        const updatedItem = {
          ...item,
          permissions: hasAction
            ? item.permissions.filter((p: any) => p !== action)
            : [...item.permissions, action],
        };
        return [...prev.slice(0, index), updatedItem, ...prev.slice(index + 1)];
      } else {
        return [...prev, { menuId, permissions: [action] }];
      }
    });
  };

  // Lưu quyền lên API
  const handleSave = async () => {
    try {
      const payload = rolePermissions.map((menu) => ({
        vai_tro_id: role.id,
        menu_id: menu.menuId,
        function: menu.permissions.join(","), // backend nhận dạng string "1,2"
      }));

      await axios.post("http://127.0.0.1:8000/api/quyen-truy-cap", payload);

      Swal.fire({
        icon: "success",
        title: "Đã lưu quyền!",
        text: `Vai trò "${role.ten_vai_tro}" đã được cập nhật.`,
      });
      onClose();
    } catch (err) {
      console.error("Lỗi khi lưu quyền:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không thể lưu quyền truy cập.",
      });
    }
  };

  if (isLoading) return <p>Đang tải danh sách menu...</p>;
  if (isError) return <p>Lỗi khi tải menu!</p>;

  return (
    <div className="modal fade show d-block" tabIndex={-1} role="dialog">
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Phân quyền cho: {role.ten_vai_tro}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <table className="table table-bordered text-center">
              <thead className="table-light">
                <tr>
                  <th>Chức năng</th>
                  {PERMISSIONS.map((perm) => (
                    <th key={perm.id}>{perm.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MENUS?.map((menu) => (
                  <tr key={menu.id}>
                    <td className="text-start">{menu.ten_chuc_nang}</td>
                    {PERMISSIONS.map((perm) => (
                      <td key={perm.id}>
                        <div className="form-check form-switch d-flex justify-content-center">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={
                              rolePermissions
                                .find((r) => r.menuId === menu.id)
                                ?.permissions.includes(perm.id) || false
                            }
                            onChange={() => togglePermission(menu.id, perm.id)}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Đóng
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
            >
              Lưu quyền
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
