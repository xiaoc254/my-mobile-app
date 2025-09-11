import React from "react";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import Login from "../pages/Login";
import Pet from "../pages/Pet";
import PetTypeSelect from "../pages/PetTypeSelect";
import Download from "../pages/Download";
import HomePage from "../components/pages/HomePage";
import SoundMonitoring from "../components/pages/SoundMonitoring";

// 路由配置接口
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  title?: string;
  hideTabBar?: boolean;
  requireAuth?: boolean;
}

// 标签栏配置接口
export interface TabConfig {
  key: string;
  path: string;
  icon: string;
  title: string;
}

// 创建包装组件以传递props
const HomePageWrapper: React.FC = () => <HomePage onNavigate={() => {}} />;
const SoundMonitoringWrapper: React.FC = () => <SoundMonitoring onNavigate={() => {}} onDataCollect={() => {}} />;

// 路由配置数组
export const routes: RouteConfig[] = [
  {
    path: "/",
    component: Home,
    title: "首页",
    hideTabBar: false,
    requireAuth: false,
  },
  {
    path: "/pet-type-select",
    component: PetTypeSelect,
    title: "选择宠物类型",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/HomePage",
    component: HomePageWrapper,
    title: "宠物日志",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/SoundMonitoring",
    component: SoundMonitoringWrapper,
    title: "录音监控",
    hideTabBar: true,
    requireAuth: false,
  },
    {
    path: "/SoundMonitoring",
    component: SoundMonitoringWrapper,
    title: "录音监控",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/pet",
    component: Pet,
    title: "宠物",
    hideTabBar: false,
    requireAuth: true,
  },
  {
    path: "/profile",
    component: Profile,
    title: "我的",
    hideTabBar: false,
    requireAuth: false,
  },
  {
    path: "/settings",
    component: Settings,
    title: "设置",
    hideTabBar: true,
    requireAuth: true,
  },
  {
    path: "/login",
    component: Login,
    title: "登录",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/download",
    component: Download,
    title: "下载",
    hideTabBar: false,
    requireAuth: false,
  },
];

// 标签栏配置数组
export const tabs: TabConfig[] = [
  {
    key: "/",
    path: "/",
    icon: "🏠",
    title: "首页",
  },
  {
    key: "/pet",
    path: "/pet",
    icon: "🐾",
    title: "宠物",
  },
  {
    key: "/download",
    path: "/download",
    icon: "📥",
    title: "商城",
  },
  {
    key: "/profile",
    path: "/profile",
    icon: "👤",
    title: "我的",
  },
];

// 获取需要隐藏TabBar的页面路径
export const getHideTabBarPages = (): string[] => {
  return routes.filter((route) => route.hideTabBar).map((route) => route.path);
};

// 根据路径获取路由配置
export const getRouteConfig = (path: string): RouteConfig | undefined => {
  return routes.find((route) => route.path === path);
};

// 导出默认配置
export default {
  routes,
  tabs,
  getHideTabBarPages,
  getRouteConfig,
};