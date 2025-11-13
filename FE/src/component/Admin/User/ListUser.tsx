

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useListUsers,
  useToggleStatus,
  useAssignRole,
} from "../../../hook/UserHook";
import type { User } from "../../../types/user";
import { useListVaiTro } from "../../../hook/VaiTroHook";

const ITEMS_PER_PAGE = 5;

export default function UserList() {
  const navigate = useNavigate();
  const { data: allUsers, isLoading } = useListUsers();
  const { data: roles } = useListVaiTro();
  const toggleStatus = useToggleStatus();
  const assignRole = useAssignRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [roleInput, setRoleInput] = useState<Record<number, string>>({});


  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter((user: User) =>
      user.ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allUsers, searchTerm]);


  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  if (isLoading) return <p className="text-center">Đang tải danh sách...</p>;

  return (
    <div className="container p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          onClick={() => navigate(`/admin/nguoi-dung/them-moi`)}
          className="btn btn-success rounded"
        >
          Thêm người dùng
        </button>

        <div className="w-50">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered mx-auto">
          <thead className="table-light">
            <tr>
              <th className="text-center">STT</th>
              <th className="text-center">Tên</th>
              <th className="text-center">Email</th>
              <th className="text-center">Vai trò</th>
              <th className="text-center">Trạng thái</th>
              <th className="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user: User, index: number) => {
                const roleName =
                  roles?.find((r: any) => r.id === user.vai_tro_id)?.ten_vai_tro ||
                  "Không xác định";

                return (
                  <tr key={user.id}>
                    <td className="text-center">
                      {index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
                    </td>
                    <td className="text-center">{user.ten}</td>
                    <td className="text-center">{user.email}</td>
                    <td className="text-center">{roleName}</td>
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
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => navigate(`/admin/nguoi-dung/${user.id}`)}
                            >
                              Xem chi tiết
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => toggleStatus.mutate(user.id)}
                            >
                              {Number(user.trang_thai) === 1 ? "Khóa" : "Mở khóa"}
                            </button>
                          </li>
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
              })
            ) : (
              // Nếu không có kết quả lọc
              <tr>
                <td colSpan={6} className="text-center text-muted">
                  Không tìm thấy người dùng.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </button>
            </li>
            <li className="page-item active">
              <span className="page-link">{currentPage} / {totalPages}</span>
            </li>
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
              >
                Sau
              </button>
            </li>
          </ul>
        </nav>
      )}

    </div>
  );
}