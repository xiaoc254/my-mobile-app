import React from "react";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import Login from "../pages/Login";
import Pet from "../pages/Pet";
import PetTypeSelect from "../pages/PetTypeSelect";
import PetTypeRizhi from "../pages/PetTypeRizhi";
import PetTypeQx from "../pages/PetTypeQx";
import PetTypeJiangKang from "../pages/PetTypejiangkang";
import PetGenderSelect from "../pages/PetGenderSelect";
// import PetAvatarNickname from "../pages/PetAvatarNickname";
// import PetAgeWeight from "../pages/PetAgeWeight";
import PetDetail from "../pages/PetDetail";
import FeedingPlan from "../pages/FeedingPlan";
import FeedingComplete from "../pages/FeedingComplete";
import ExercisePlan from "../pages/ExercisePlan";
import DailyLog from "../pages/DailyLog";
import TemperatureRecord from "../pages/TemperatureRecord";
// import TestPage from "../pages/TestPage"; // New import
import Download from "../pages/Download";
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
    path: "/pet-type-jiangkang",
    component: PetTypeJiangKang,
    title: "宠物健康",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/pet-type-rizhi",
    component: PetTypeRizhi,
    title: "宠物日志",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/pet-avatar-nickname",
    component: PetAvatarNickname,
    title: "头像和昵称",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/pet-age-weight",
    component: PetAgeWeight,
    title: "宠物年龄和体重",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/pet-detail",
    component: PetDetail,
    title: "宠物详情",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/feeding-plan",
    component: FeedingPlan,
    title: "喂食计划",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/feeding-complete",
    component: FeedingComplete,
    title: "完成喂食",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/exercise-plan",
    component: ExercisePlan,
    title: "运动计划",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/daily-log",
    component: DailyLog,
    title: "每日日志",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/temperature-record",
    component: TemperatureRecord,
    title: "体温记录",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/test",
    component: TestPage,
    title: "功能测试",
    hideTabBar: true,
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
    path: "/pet-type-Qx",
    component: PetTypeQx,
    title: "宠物情绪",
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
