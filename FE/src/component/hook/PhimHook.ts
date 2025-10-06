import { useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import { getCreatePhim, getDeletePhim, getListPhim, getUpdatePhim } from "../provider/PhimProvider";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export const useListPhim = ({ resource = "phim" }: any) => {
  return useQuery({
    queryKey: [resource],
    queryFn: () => getListPhim({ resource }),
  });
};


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

export const useCreatePhim = ({ resource = "phim" }: any) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: any) => getCreatePhim({ resource, values }),
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

export const useUpdatePhim = ({ resource = "phim" }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ id, values }: { id: number | string; values: any }) =>
      getUpdatePhim({ resource, id, values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] });
      Swal.fire({
        icon: "success",
        title: "Cập nhật thành công",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/admin/phim");
    },
    onError: (error: any) => {
      console.error("Update Phim error:", error.response?.data || error);

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