import "antd/dist/reset.css";
import Routermain from "./component/Router";
import "@fortawesome/fontawesome-free/css/all.min.css";

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
