import React from "react";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import Login from "../pages/Login";
import Pet from "../pages/Pet";
import Download from "../pages/Download";
import Product from "../pages/Product";
import Shop from "../pages/Shop";
import OrderManagement from "../pages/OrderManagement";

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
  title: string;
}

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
    path: "/pet",
    component: Pet,
    title: "宠物",
    hideTabBar: false,
    requireAuth: false,
  },
  {
    path: "/download",
    component: Download,
    title: "商城",
    hideTabBar: false,
    requireAuth: false,
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
    path: "/product/:id",
    component: Product,
    title: "商品详情",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/shop",
    component: Shop,
    title: "商城",
    hideTabBar: false,
    requireAuth: false,
  },
  {
    path: "/order-management",
    component: OrderManagement,
    title: "订单管理",
    hideTabBar: true,
    requireAuth: false,
  },
];

// 标签栏配置数组
export const tabs: TabConfig[] = [
  {
    key: "/",
    path: "/",
    title: "首页",
  },
  {
    key: "/pet",
    path: "/pet",
    title: "宠物",
  },
  {
    key: "/download",
    path: "/download",
    title: "商城",
  },
  {
    key: "/profile",
    path: "/profile",
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
