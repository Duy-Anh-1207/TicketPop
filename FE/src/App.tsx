import "antd/dist/reset.css";
import Routermain from "./Router";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Tạo client của React Query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <Routermain />
    </QueryClientProvider>
  );
}

export default App;
