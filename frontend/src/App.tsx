// App.tsx
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { TabBar } from "antd-mobile";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

function App() {
  const navigate = useNavigate();

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
      </Routes>

      <TabBar>
        <TabBar.Item key="home" icon="🏠" title="首页" onClick={() => handleTabClick("/")} />
        <TabBar.Item key="profile" icon="👤" title="我的" onClick={() => handleTabClick("/profile")} />
        <TabBar.Item key="settings" icon="⚙️" title="设置" onClick={() => handleTabClick("/settings")} />
      </TabBar>
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
