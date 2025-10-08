import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useListUsers,
  useToggleStatus,
  useAssignRole,
} from "../../hook/UserHook";
import type { User } from "../../types/User";

export default function UserList() {
  const navigate = useNavigate();
  const { data: users, isLoading } = useListUsers();
  const toggleStatus = useToggleStatus();
  const assignRole = useAssignRole();

  // Lưu trạng thái select role cho từng user
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
            {users?.map((user: User) => (
              <tr key={user.id}>
                <td className="text-center">{user.id}</td>
                <td className="text-center">{user.name}</td>
                <td className="text-center">{user.email}</td>
                <td className="text-center">{user.role}</td>
                <td className="text-center">
                  {user.is_active === 1 ? "Hoạt động" : "Khóa"}
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
                    <ul
                      className="dropdown-menu"
                      style={{ minWidth: "200px" }}
                    >
                      {/* Xem chi tiết */}
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() =>
                            navigate(`/admin/nguoi-dung/${user.id}`)
                          }
                        >
                          Xem
                        </button>
                      </li>

                      {/* Bật/tắt trạng thái */}
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => toggleStatus.mutate(user.id)}
                        >
                          {user.is_active ? "Khóa" : "Mở khóa"}
                        </button>
                      </li>

                      {/* Thay đổi vai trò */}
                      <li className="dropdown-item d-flex flex-column">
                        <span className="mb-1">Thay đổi vai trò</span>
                        <div className="d-flex gap-1">
                          <select
                            className="form-select form-select-sm"
                            value={roleInput[user.id] ?? user.role}
                            onChange={(e) =>
                              setRoleInput({
                                ...roleInput,
                                [user.id]: e.target.value,
                              })
                            }
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>

                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              assignRole.mutate({
                                id: user.id,
                                role: roleInput[user.id] ?? user.role,
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
