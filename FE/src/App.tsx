import "antd/dist/reset.css";
import Routermain from "./Router";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./component/Auth/AuthContext";  // ✅ Thêm AuthProvider

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>   {/* ✅ Bọc toàn bộ App để React lưu user + permissions */}
        <Routermain />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
