import {
  getListPhienBan,
} from "../provider/PhienBanProvider";

import { useQuery } from "@tanstack/react-query";
import type { PhienBan } from "../types/phienban";

// 🔹 Lấy danh sách
export const useListPhienBan = () =>
  useQuery<PhienBan[]>({
    queryKey: ["phien-ban"],
    queryFn: getListPhienBan,
  });

