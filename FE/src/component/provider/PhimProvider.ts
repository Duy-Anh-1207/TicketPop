import axios from "axios";

<<<<<<< HEAD

=======
>>>>>>> cfed1d3e82ae3a6ee389aaddb71003236ff80442
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getListPhim = async ({ resource = "phim" }) => {
    const { data } = await axiosClient.get(resource);
    return data;
};

export const getDeletePhim = async ({
    resource = "phim",
    id,
}: any) => {
    if (!id) return;
    const { data } = await axiosClient.delete(`${resource}/${id}`);
    return data;
};

export const getCreatePhim = async ({
    resource = "phim",
    values,
}: any) => {
    const { data } = await axiosClient.post(resource, values);
    return data;
};

export const getUpdatePhim = async ({
    resource = "phim",
    id,
    values,
}: any) => {
    if (!id || !values) return;

    if (values instanceof FormData) {
        // gửi POST với _method=PUT giả lập PUT để upload file
        values.append("_method", "PUT");
        const { data } = await axiosClient.post(`${resource}/${id}`, values, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return data;
    } else {
        // gửi PUT hoặc PATCH với JSON
        const { data } = await axiosClient.put(`${resource}/${id}`, values);
        return data;
    }
};