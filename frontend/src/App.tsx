// App.tsx
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { TabBar } from "antd-mobile";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Pet from "./pages/Pet";
import Download from "./pages/Download";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  // 不显示TabBar的页面
  const hideTabBarPages = ['/login', '/settings'];
  const shouldShowTabBar = !hideTabBarPages.includes(location.pathname);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pet" element={<Pet />} />
        <Route path="/download" element={<Download />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
      </Routes>

      {shouldShowTabBar && (
        <TabBar
          activeKey={location.pathname}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            borderTop: '1px solid #eee',
            zIndex: 1000
          }}
        >
          <TabBar.Item
            key="/"
            icon={<span style={{ fontSize: '20px', color: location.pathname === '/' ? '#1677ff' : '#999' }}>🏠</span>}
            title={<span style={{ color: location.pathname === '/' ? '#1677ff' : '#999' }}>首页</span>}
            onClick={() => handleTabClick("/")}
          />
          <TabBar.Item
            key="/pet"
            icon={<span style={{ fontSize: '20px', color: location.pathname === '/pet' ? '#1677ff' : '#999' }}>🐾</span>}
            title={<span style={{ color: location.pathname === '/pet' ? '#1677ff' : '#999' }}>宠物</span>}
            onClick={() => handleTabClick("/pet")}
          />
          <TabBar.Item
            key="/download"
            icon={<span style={{ fontSize: '20px', color: location.pathname === '/download' ? '#1677ff' : '#999' }}>📥</span>}
            title={<span style={{ color: location.pathname === '/download' ? '#1677ff' : '#999' }}>商城</span>}
            onClick={() => handleTabClick("/download")}
          />
          <TabBar.Item
            key="/profile"
            icon={<span style={{ fontSize: '20px', color: location.pathname === '/profile' ? '#1677ff' : '#999' }}>👤</span>}
            title={<span style={{ color: location.pathname === '/profile' ? '#1677ff' : '#999' }}>我的</span>}
            onClick={() => handleTabClick("/profile")}
          />
        </TabBar>
      )}
    </div>
  );
}

export default function RouterWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
