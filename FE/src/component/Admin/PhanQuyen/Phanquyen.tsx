import type { VaiTro } from "../../../types/vaitro";
import type { Menu } from "../../../types/menu";
import Swal from "sweetalert2";
import { useEffect, useState, type JSX } from "react";
import axios from "axios";
import { useMenuTree } from "../../../hook/VaiTroHook";

const PERMISSIONS = [
  { id: 1, name: "Thêm" },
  { id: 2, name: "Sửa" },
  { id: 3, name: "Xóa" },
  { id: 4, name: "Xem" },
];

type RolePermission = {
  menuId: number;
  permissions: number[];
};

type Props = {
  role: VaiTro;
  onClose: () => void;
};

export default function RolePermissionModal({ role, onClose }: Props) {
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [expandedMenus, setExpandedMenus] = useState<number[]>([]); // menu đang mở

  const { data: menus, isLoading } = useMenuTree();
  const menuTree: Menu[] = menus ?? [];

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/quyen-truy-cap").then((res) => {
      const roleData = res.data.data.filter((i: any) => i.vai_tro_id === role.id);
      setRolePermissions(
        roleData.map((item: any) => ({
          menuId: item.menu_id,
          permissions: item.function.map(Number),
        }))
      );
    });
  }, [role.id]);

  const isChecked = (menuId: number, perm: number) =>
    rolePermissions.find((p) => p.menuId === menuId)?.permissions.includes(perm) || false;

  const applyToChildren = (
    node: Menu,
    perm: number,
    checked: boolean,
    list: RolePermission[]
  ) => {
    const idx = list.findIndex((p) => p.menuId === node.id);
    if (idx !== -1) {
      list[idx].permissions = checked
        ? Array.from(new Set([...list[idx].permissions, perm]))
        : list[idx].permissions.filter((x) => x !== perm);
    } else if (checked) {
      list.push({ menuId: node.id, permissions: [perm] });
    }
    node.children?.forEach((child: Menu) => applyToChildren(child, perm, checked, list));
  };

  const checkParentStatus = (
    menuId: number,
    perm: number,
    tree: Menu[],
    list: RolePermission[]
  ) => {
    const findParent = (nodes: Menu[], parent: Menu | null = null): any => {
      for (let n of nodes) {
        if (n.id === menuId) return parent;
        const found = findParent(n.children ?? [], n);
        if (found !== null) return found;
      }
      return null;
    };
    const parent = findParent(tree);
    if (!parent) return;
    const allChildrenChecked = parent.children!.every(
      (child: { id: number }) => list.find((p) => p.menuId === child.id)?.permissions.includes(perm)
    );
    const parentIdx = list.findIndex((p) => p.menuId === parent.id);
    if (allChildrenChecked) {
      if (parentIdx !== -1)
        list[parentIdx].permissions = Array.from(new Set([...list[parentIdx].permissions, perm]));
      else list.push({ menuId: parent.id, permissions: [perm] });
    } else {
      if (parentIdx !== -1)
        list[parentIdx].permissions = list[parentIdx].permissions.filter((p) => p !== perm);
    }
    checkParentStatus(parent.id, perm, tree, list);
  };

  const togglePermission = (menu: Menu, perm: number, checked: boolean) => {
    setRolePermissions((prev) => {
      const updated = structuredClone(prev);
      applyToChildren(menu, perm, checked, updated);
      checkParentStatus(menu.id, perm, menuTree, updated);
      return updated;
    });
  };

  const toggleExpand = (menuId: number) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  };

  const handleSave = async () => {
    try {
      const payload = rolePermissions.map((p) => ({
        vai_tro_id: role.id,
        menu_id: p.menuId,
        function: p.permissions.join(","),
      }));
      await axios.post("http://127.0.0.1:8000/api/quyen-truy-cap", payload);
      Swal.fire("✔ Thành công", "Đã lưu phân quyền!", "success");
      onClose();
    } catch {
      Swal.fire("❌ Lỗi", "Không thể lưu!", "error");
    }
  };

  if (isLoading) return <p>Đang tải menu…</p>;

  const renderTree = (nodes: Menu[], level = 0): JSX.Element[] =>
    nodes.flatMap((node) => {
      const isExpanded = expandedMenus.includes(node.id);
      const hasChildren = node.children && node.children.length > 0;
      return [
        <tr key={node.id}>
          <td style={{ paddingLeft: `${level * 20}px`, textAlign: "left" }}>
            {hasChildren && (
              <button
                type="button"
                className="btn btn-sm btn-light me-1"
                onClick={() => toggleExpand(node.id)}
              >
                {isExpanded ? "-" : "+"}
              </button>
            )}
            {node.ten_chuc_nang}
          </td>
          {PERMISSIONS.map((perm) => (
            <td key={perm.id}>
              <input
                type="checkbox"
                checked={isChecked(node.id, perm.id)}
                onChange={(e) => togglePermission(node, perm.id, e.target.checked)}
              />
            </td>
          ))}
        </tr>,
        ...(hasChildren && isExpanded ? renderTree(node.children!, level + 1) : []),
      ];
    });

  return (
    <div className="modal fade show d-block">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5>Phân quyền cho: {role.ten_vai_tro}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <table className="table table-bordered text-center">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Chức năng</th>
                  {PERMISSIONS.map((p) => (
                    <th key={p.id}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{renderTree(menuTree)}</tbody>
            </table>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Đóng
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Lưu quyền
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
