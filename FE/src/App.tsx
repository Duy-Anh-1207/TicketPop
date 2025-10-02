// import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './component/Sidebar';
import Header from './component/Header';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div id="main-wrapper" className="flex flex-col min-h-screen">
        <Sidebar />
        <div className="page-wrapper flex-1 ml-64">
          <div className="body-wrapper">
            <div className="container-fluid">
              <Header />
              <div className="mt-4">
                {/* <h1>TicketPop</h1> */}
              </div>
            </div>
          </div>
        </div>
        <div className="dark-transparent sidebartoggler"></div>
      </div>
    </Router>
  );
};

export default App;