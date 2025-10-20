import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCreatePhim, getDeletePhim, getListPhienBan, getListPhim, getListTheLoai, getUpdatePhim } from "../provider/PhimProvider";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

/** Lấy danh sách phim */
export const useListPhim = ({ resource = "phim" }: any) => {
  return useQuery({
    queryKey: [resource],
    queryFn: () => getListPhim({ resource }),
  });
};

export const useListTheLoai = () => {
  return useQuery({
    queryKey: ['the-loai'],
    queryFn: async () => {
      const res = await getListTheLoai({ resource: 'the-loai' });
      return res.data; // chỉ trả mảng
    },
  });
};

export const useListPhienBan = () => {
  return useQuery({
    queryKey: ['phien-ban'],
    queryFn: async () => {
      const res = await getListPhienBan({ resource: 'phien-ban' });
      return res.data; 
    },
  });
};

/** Xóa phim */
export const useDeletePhim = ({ resource = "phim" }: any) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id?: string | number) => getDeletePhim({ resource, id }),
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Xóa thành công",
        timer: 1500,
        showConfirmButton: false,
      });
      queryClient.invalidateQueries({ queryKey: [resource] });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: "error",
        title: "Xóa thất bại",
        text: error.response?.data?.message || "Có lỗi xảy ra",
      });
    },
  });
};

/** Thêm phim */
export const useCreatePhim = ({ resource = "phim" }: any) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      // Nếu có file => FormData
      const hasFile = values.anh_poster instanceof File;
      let formData: any = values;

      if (hasFile) {
        formData = new FormData();
        Object.entries(values).forEach(([key, val]) => {
          if (Array.isArray(val)) {
            // Mảng (thể loại, phiên bản) => "1,2,3"
            formData.append(key, val.join(","));
          } else {
            formData.append(key, val as any);
          }
        });
      }

      return await getCreatePhim({ resource, values: formData });
    },
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Thêm thành công",
        timer: 1500,
        showConfirmButton: false,
      });
      queryClient.invalidateQueries({ queryKey: [resource] });
    },
    onError: (error: any) => {
      const messages = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join("\n")
        : error.response?.data?.message || "Thêm thất bại";

      Swal.fire({
        icon: "error",
        title: "Thêm thất bại",
        text: messages,
      });
    },
  });
};

/** Cập nhật phim */
export const useUpdatePhim = ({ resource = "phim" }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ id, values }: { id: number | string; values: any }) => {
      const hasFile = values.anh_poster instanceof File;
      let formData: any = values;

      if (hasFile) {
        formData = new FormData();
        Object.entries(values).forEach(([key, val]) => {
          if (Array.isArray(val)) {
            formData.append(key, val.join(","));
          } else {
            formData.append(key, val as any);
          }
        });
      }

      return await getUpdatePhim({ resource, id, values: formData });
    },
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Cập nhật thành công",
        timer: 1500,
        showConfirmButton: false,
      });
      queryClient.invalidateQueries({ queryKey: [resource] });
      navigate("/admin/phim");
    },
    onError: (error: any) => {
      const messages = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join("\n")
        : error.response?.data?.message || "Cập nhật thất bại";

      Swal.fire({
        icon: "error",
        title: "Cập nhật thất bại",
        text: messages,
      });
    },
  });
};
