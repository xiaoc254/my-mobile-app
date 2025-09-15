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
import Cart from "../pages/Cart";
import Ai from "../pages/Ai";
import PetTypeSelect from "../pages/PetTypeSelect";
import PetGenderSelect from "../pages/PetGenderSelect";
import PetAvatarNickname from "../pages/PetAvatarNickname";
import PetAgeWeight from "../pages/PetAgeWeight";
import PetDetail from "../pages/PetDetail";
import PetTypeRizhi from "../pages/PetTypeRizhi";
import PetTypeJiangkang from "../pages/PetTypejiangkang";
import ExercisePlan from "../pages/ExercisePlan";
import FeedingPlan from "../pages/FeedingPlan";
import DailyLog from "../pages/DailyLog";
import TemperatureRecord from "../pages/TemperatureRecord";
import FeedingComplete from "../pages/FeedingComplete";
import Welcome from "../pages/Welcome";
import PetRecipeSelect from "../pages/PetRecipeSelect";
import DogRecipe from "../pages/DogRecipe";
import CatRecipe from "../pages/CatRecipe";
import HealthMonitor from "../pages/HealthMonitor";
import VoiceAnalysis from "../pages/VoiceAnalysis";
import VoiceAnalysisResult from "../pages/VoiceAnalysisResult";
import VisualBehaviorAnalysis from "../pages/VisualBehaviorAnalysis";
import VisualAnalysisResult from "../pages/VisualAnalysisResult";
import AuthCallback from "../pages/AuthCallback";
import SMSLogin from "../pages/SMSLogin";
import WXCallback from "../pages/WXCallback";

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
    component: Welcome,
    title: "欢迎",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/auth-callback",
    component: AuthCallback,
    title: "授权回调",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/sms-login",
    component: SMSLogin,
    title: "短信登录",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/wx-callback",
    component: WXCallback,
    title: "微信回调",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/weibo-callback",
    component: AuthCallback,
    title: "微博登录回调",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/home",
    component: Home,
    title: "首页",
    hideTabBar: false,
    requireAuth: false,
  },
  {
    path: "/feeding-complete",
    component: FeedingComplete,
    title: "喂食完成",
    hideTabBar: true,
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
    path: "/ai",
    component: Ai,
    title: "聊天",
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
    path: "/profile",
    component: Profile,
    title: "我的",
    hideTabBar: false,
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
    path: "/feeding-plan",
    component: FeedingPlan,
    title: "喂食计划",
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
    path: "/cart",
    component: Cart,
    title: "购物车",
    hideTabBar: true,
    requireAuth: true,
  },
  {
    path: "/product/:id",
    component: Product,
    title: "商品详情",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/pet-type-select",
    component: PetTypeSelect,
    title: "宠物类型",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/pet-gender-select",
    component: PetGenderSelect,
    title: "宠物性别",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/pet-avatar-nickname",
    component: PetAvatarNickname,
    title: "宠物昵称",
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
    path: "/pet-type-rizhi",
    component: PetTypeRizhi,
    title: "宠物日志",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/pet-type-jiangkang",
    component: PetTypeJiangkang,
    title: "宠物健康",
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
  {
    path: "/pet-recipe-select",
    component: PetRecipeSelect,
    title: "科学食谱",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/dog-recipe",
    component: DogRecipe,
    title: "狗狗营养食物推荐",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/cat-recipe",
    component: CatRecipe,
    title: "猫猫营养食物推荐",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/health-monitor",
    component: HealthMonitor,
    title: "健康监测",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/voice-analysis",
    component: VoiceAnalysis,
    title: "声音情绪识别",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/voice-analysis-result",
    component: VoiceAnalysisResult,
    title: "声音分析结果",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/visual-behavior-analysis",
    component: VisualBehaviorAnalysis,
    title: "视觉行为分析",
    hideTabBar: true,
    requireAuth: false,
  },
  {
    path: "/visual-analysis-result",
    component: VisualAnalysisResult,
    title: "视觉分析结果",
    hideTabBar: true,
    requireAuth: false,
  },
];

// 标签栏配置数组
export const tabs: TabConfig[] = [
  {
    key: "/home",
    path: "/home",
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
    key: "/shop",
    path: "/shop",
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
