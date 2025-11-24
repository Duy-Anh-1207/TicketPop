// donVe.hook.ts
import { useQuery } from "@tanstack/react-query";
import {
  getDanhSachDatVe,
  getChiTietVe,
  getChiTietVeTheoMaGD,
  getInVe
} from "../provider/DonVeProvider";

// ======================== Danh sách đơn vé ========================
export const useDanhSachDonVe = () => {
  return useQuery({
    queryKey: ["don-ve"],
    queryFn: async () => {
      const res = await getDanhSachDatVe();
      return res.data; // chỉ trả về data
    },
  });
};

// ======================== Chi tiết đơn vé ========================
export const useChiTietDonVe = (id?: number | string) => {
  return useQuery({
    queryKey: ["don-ve", id],
    queryFn: async () => {
      const res = await getChiTietVe(id!);
      return res.data;
    },
    enabled: !!id, // chỉ gọi khi có id
  });
};

export const useChiTietDonVeTheoMaGD = (maGiaoDich?: string) => {
  return useQuery({
    queryKey: ["don-ve-maGD", maGiaoDich],
    queryFn: async () => {
      const res = await getChiTietVeTheoMaGD(maGiaoDich!);
      return res.data; // trả về payload vé
    },
    enabled: !!maGiaoDich,
  });
};


// ======================== In vé ========================
export const useInVe = (maGiaoDich?: string) => {
  return useQuery({
    queryKey: ["in-ve", maGiaoDich],
    queryFn: () => getInVe(maGiaoDich!),
    enabled: !!maGiaoDich,
  });
};

