import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { TabBar } from "antd-mobile";
import {
  AppOutline,
  UserOutline,
  ShopbagOutline,
  TeamOutline
} from "antd-mobile-icons";
import { routes, tabs, getHideTabBarPages } from "./route/route";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideTabBarPages = getHideTabBarPages();
  const shouldHideTabBar = hideTabBarPages.includes(location.pathname) ||
    location.pathname.startsWith('/product/');

  const getTabIcon = (path: string) => {
    switch (path) {
      case "/":
        return <AppOutline />;
      case "/pet":
        return <TeamOutline />;
      case "/download":
        return <ShopbagOutline />;
      case "/profile":
        return <UserOutline />;
      default:
        return <AppOutline />;
    }
  };


  return (
    <div>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.component />}
          />
        ))}
      </Routes>

      {!shouldHideTabBar && (
        <TabBar
          activeKey={location.pathname}
          onChange={(key) => navigate(key)}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: "white",
            borderTop: "1px solid #f0f0f0"
          }}
        >
          {tabs.map((tab) => (
            <TabBar.Item
              key={tab.path}
              icon={getTabIcon(tab.path)}
              title={tab.title}
            />
          ))}
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
