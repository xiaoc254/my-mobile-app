// useResponsive.ts - 全局响应式Hook
import { useState, useEffect } from 'react';

// 响应式断点定义
export const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1200,
  ultraWide: 1600
} as const;

// 屏幕类型定义
export type ScreenType = 'mobile' | 'tablet' | 'desktop' | 'largeDesktop' | 'ultraWide';

// 设备方向
export type Orientation = 'portrait' | 'landscape';

// 响应式状态接口
export interface ResponsiveState {
  screenType: ScreenType;
  width: number;
  height: number;
  orientation: Orientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isUltraWide: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  pixelRatio: number;
}

// 获取屏幕类型
const getScreenType = (width: number): ScreenType => {
  if (width < breakpoints.mobile) return 'mobile';
  if (width < breakpoints.tablet) return 'tablet';
  if (width < breakpoints.desktop) return 'desktop';
  if (width < breakpoints.largeDesktop) return 'largeDesktop';
  return 'ultraWide';
};

// 获取设备方向
const getOrientation = (width: number, height: number): Orientation => {
  return width > height ? 'landscape' : 'portrait';
};

// 创建响应式状态
const createResponsiveState = (width: number, height: number): ResponsiveState => {
  const screenType = getScreenType(width);
  const orientation = getOrientation(width, height);

  return {
    screenType,
    width,
    height,
    orientation,
    isMobile: screenType === 'mobile',
    isTablet: screenType === 'tablet',
    isDesktop: screenType === 'desktop',
    isLargeDesktop: screenType === 'largeDesktop',
    isUltraWide: screenType === 'ultraWide',
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    pixelRatio: window.devicePixelRatio || 1
  };
};

// 响应式Hook
export const useResponsive = (): ResponsiveState => {
  const [responsiveState, setResponsiveState] = useState<ResponsiveState>(() => {
    // 服务端渲染兼容
    if (typeof window === 'undefined') {
      return createResponsiveState(1200, 800);
    }
    return createResponsiveState(window.innerWidth, window.innerHeight);
  });

  useEffect(() => {
    const handleResize = () => {
      setResponsiveState(createResponsiveState(window.innerWidth, window.innerHeight));
    };

    // 防抖处理
    let timeoutId: NodeJS.Timeout;
    const debouncedHandleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    // 初始化
    handleResize();

    // 监听窗口大小变化
    window.addEventListener('resize', debouncedHandleResize);

    // 监听设备方向变化
    window.addEventListener('orientationchange', debouncedHandleResize);

    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
      window.removeEventListener('orientationchange', debouncedHandleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return responsiveState;
};

// 响应式样式生成器
export const createResponsiveStyles = (responsive: ResponsiveState) => {
  const { isMobile, isTablet, isDesktop } = responsive;

  return {
    // 容器样式
    container: {
      padding: isMobile ? '10px' : isTablet ? '15px' : '20px',
      maxWidth: isMobile ? '100%' : isTablet ? '100%' : isDesktop ? '1024px' : '1200px',
      margin: '0 auto',
      width: '100%'
    },

    // 页面内边距
    pageContainer: {
      padding: isMobile ? '15px' : isTablet ? '20px' : '30px',
      paddingBottom: isMobile ? '80px' : isTablet ? '90px' : '100px', // 为底部TabBar预留空间
      minHeight: '100vh'
    },

    // 卡片样式
    card: {
      borderRadius: isMobile ? '12px' : isTablet ? '16px' : '20px',
      padding: isMobile ? '16px' : isTablet ? '20px' : '24px',
      margin: isMobile ? '8px 0' : isTablet ? '12px 0' : '16px 0'
    },

    // 按钮样式
    button: {
      padding: isMobile ? '12px 20px' : isTablet ? '14px 24px' : '16px 28px',
      fontSize: isMobile ? '14px' : isTablet ? '16px' : '18px',
      borderRadius: isMobile ? '8px' : isTablet ? '10px' : '12px',
      minHeight: isMobile ? '44px' : isTablet ? '48px' : '52px'
    },

    // 标题样式
    title: {
      fontSize: isMobile ? '20px' : isTablet ? '24px' : isDesktop ? '28px' : '32px',
      lineHeight: isMobile ? '28px' : isTablet ? '32px' : isDesktop ? '36px' : '40px',
      marginBottom: isMobile ? '16px' : isTablet ? '20px' : '24px'
    },

    // 副标题样式
    subtitle: {
      fontSize: isMobile ? '16px' : isTablet ? '18px' : '20px',
      lineHeight: isMobile ? '24px' : isTablet ? '26px' : '28px',
      marginBottom: isMobile ? '12px' : isTablet ? '16px' : '20px'
    },

    // 文本样式
    text: {
      fontSize: isMobile ? '14px' : isTablet ? '15px' : '16px',
      lineHeight: isMobile ? '20px' : isTablet ? '22px' : '24px'
    },

    // 输入框样式
    input: {
      padding: isMobile ? '12px 16px' : isTablet ? '14px 18px' : '16px 20px',
      fontSize: isMobile ? '16px' : isTablet ? '16px' : '18px', // 移动端保持16px防止缩放
      borderRadius: isMobile ? '8px' : isTablet ? '10px' : '12px',
      minHeight: isMobile ? '44px' : isTablet ? '48px' : '52px'
    },

    // 图标样式
    icon: {
      fontSize: isMobile ? '18px' : isTablet ? '20px' : '24px',
      width: isMobile ? '24px' : isTablet ? '28px' : '32px',
      height: isMobile ? '24px' : isTablet ? '28px' : '32px'
    },

    // 头像样式
    avatar: {
      width: isMobile ? '40px' : isTablet ? '48px' : '56px',
      height: isMobile ? '40px' : isTablet ? '48px' : '56px',
      borderRadius: '50%'
    },

    // 网格布局
    grid: {
      display: 'grid',
      gap: isMobile ? '12px' : isTablet ? '16px' : '20px',
      gridTemplateColumns: isMobile
        ? 'repeat(auto-fit, minmax(150px, 1fr))'
        : isTablet
        ? 'repeat(auto-fit, minmax(200px, 1fr))'
        : 'repeat(auto-fit, minmax(250px, 1fr))'
    },

    // Flexbox 布局
    flex: {
      display: 'flex',
      gap: isMobile ? '8px' : isTablet ? '12px' : '16px'
    }
  };
};

// 媒体查询Hook
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

// 常用媒体查询
export const useCommonMediaQueries = () => {
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.mobile - 1}px)`);
  const isTablet = useMediaQuery(`(min-width: ${breakpoints.mobile}px) and (max-width: ${breakpoints.desktop - 1}px)`);
  const isDesktop = useMediaQuery(`(min-width: ${breakpoints.desktop}px)`);
  const isLandscape = useMediaQuery('(orientation: landscape)');
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    isPortrait,
    isDarkMode,
    isReducedMotion
  };
};
