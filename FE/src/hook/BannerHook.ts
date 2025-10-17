import {
  getListBanners
} from "../provider/BannerProvider";

import { useQuery } from "@tanstack/react-query";
import type { Banner } from "../types/banner";

//Lấy danh sách banners
export const useListBanners = () => useQuery<Banner[]>({
    queryKey: ["banners"],
    queryFn: getListBanners,
  });