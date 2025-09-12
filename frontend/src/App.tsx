// App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { TabBar } from "antd-mobile";
import { routes, tabs, getHideTabBarPages } from "./route/route";
import { AuthProvider } from "./context/AuthContext";
import { PetFormProvider } from "./context/PetFormContext";
import AuthGuard from "./components/AuthGuard";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  // 不显示TabBar的页面
  const hideTabBarPages = getHideTabBarPages();

  // 检查当前路径是否需要隐藏TabBar，支持动态路由
  const shouldShowTabBar = !hideTabBarPages.some((hidePath) => {
    if (hidePath.includes(":")) {
      // 处理动态路由，如 /product/:id
      const pathPattern = hidePath.replace(/:\w+/g, "[^/]+");
      const regex = new RegExp(`^${pathPattern}$`);
      return regex.test(location.pathname);
    }
    // 处理静态路由
    return location.pathname === hidePath;
  });

  return (
    <div>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <AuthGuard requireAuth={route.requireAuth}>
                <route.component />
              </AuthGuard>
            }
          />
        ))}
      </Routes>

      {shouldShowTabBar && (
        <TabBar
          activeKey={location.pathname}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            borderTop: "1px solid #eee",
            zIndex: 1000,
          }}
        >
          {tabs.map((tab) => (
            <TabBar.Item
              key={tab.key}
              icon={
                <span
                  style={{
                    fontSize: "20px",
                    color: location.pathname === tab.path ? "#1677ff" : "#999",
                  }}
                >
                  {tab.icon}
                </span>
              }
              title={
                <span
                  style={{
                    color: location.pathname === tab.path ? "#1677ff" : "#999",
                  }}
                >
                  {tab.title}
                </span>
              }
              onClick={() => handleTabClick(tab.path)}
            />
          ))}
        </TabBar>
      )}
    </div>
  );
}

export default function RouterWrapper() {
  return (
    <AuthProvider>
      <PetFormProvider>
        <Router>
          <App />
        </Router>
      </PetFormProvider>
    </AuthProvider>
  );
}
