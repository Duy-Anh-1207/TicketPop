import "antd/dist/reset.css";
import Routermain from "./component/Router";
import "@fortawesome/fontawesome-free/css/all.min.css";

<<<<<<< HEAD

function App() {
  return (
    <Routermain />
  )
=======
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Tạo client của React Query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routermain />
    </QueryClientProvider>
  );
>>>>>>> cfed1d3e82ae3a6ee389aaddb71003236ff80442
}

export default App;
