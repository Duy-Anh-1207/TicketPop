import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useListUsers,
  useToggleStatus,
  useAssignRole,
} from "../../../hook/UserHook";
import type { User } from "../../../types/user";
import { useListVaiTro } from "../../../hook/VaiTroHook";

export default function UserList() {
  const navigate = useNavigate();
  const { data: users, isLoading } = useListUsers();
  const { data: roles } = useListVaiTro();
  const toggleStatus = useToggleStatus();
  const assignRole = useAssignRole();

  const [roleInput, setRoleInput] = useState<Record<number, string>>({});

  if (isLoading) return <p className="text-center">Đang tải danh sách...</p>;

  return (
    <div className="container p-4">
      <div className="mb-3">
        <button
          onClick={() => navigate(`/admin/nguoi-dung/them-moi`)}
          className="btn btn-success rounded"
        >
          Thêm người dùng
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered mx-auto">
          <thead className="table-light">
            <tr>
              <th className="text-center">ID</th>
              <th className="text-center">Tên</th>
              <th className="text-center">Email</th>
              <th className="text-center">Vai trò</th>
              <th className="text-center">Trạng thái</th>
              <th className="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user: User) => {
              const roleName =
                roles?.find((r: any) => r.id === user.vai_tro_id)?.ten_vai_tro ||
                "Không xác định";

              return (
                <tr key={user.id}>
                  <td className="text-center">{user.id}</td>
                  <td className="text-center">{user.ten}</td>
                  <td className="text-center">{user.email}</td>
                  <td className="text-center">{roleName}</td>

                  {/* ✅ hiển thị đúng với giá trị 0/1 */}
                  <td className="text-center">
                    {Number(user.trang_thai) === 1
                      ? "Đã kích hoạt"
                      : "Ngưng kích hoạt"}
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
                            onClick={() => navigate(`/admin/nguoi-dung/${user.id}`)}
                          >
                            Xem chi tiết
                          </button>
                        </li>

                        {/* ✅ Bật/tắt trạng thái đúng cách */}
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => toggleStatus.mutate(user.id)}
                          >
                            {Number(user.trang_thai) === 1 ? "Khóa" : "Mở khóa"}
                          </button>
                        </li>

                        {/* Thay đổi vai trò */}
                        <li className="dropdown-item d-flex flex-column">
                          <span className="mb-1">Thay đổi vai trò</span>
                          <div className="d-flex gap-1">
                            <select
                              className="form-select form-select-sm"
                              value={roleInput[user.id] ?? user.vai_tro_id}
                              onChange={(e) =>
                                setRoleInput({
                                  ...roleInput,
                                  [user.id]: e.target.value,
                                })
                              }
                            >
                              {roles?.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.ten_vai_tro}
                                </option>
                              ))}
                            </select>

                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => {
                                assignRole.mutate({
                                  id: user.id,
                                  vai_tro_id: Number(roleInput[user.id] ?? user.vai_tro_id),
                                });
                              }}
                            >
                              Cập nhật
                            </button>

                          </div>
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
