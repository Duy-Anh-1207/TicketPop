import Header from '../component/Layout/ClientLayout/Header/Header';
import Footer from '../component/Layout/ClientLayout/Footer/Footer';
import { Outlet } from 'react-router-dom';

const LayoutWeb = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#000',          // 👈 QUAN TRỌNG
      }}
    >
      <Header />
      <main style={{ flex: 1, background: '#000' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};



export default LayoutWeb;