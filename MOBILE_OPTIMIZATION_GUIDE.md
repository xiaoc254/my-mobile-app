# 📱 移动端优化与工程化配置详解

## 目录

- [移动端响应式设计](#移动端响应式设计)
- [手势识别系统](#手势识别系统)
- [性能优化技术](#性能优化技术)
- [离线支持实现](#离线支持实现)
- [工程化配置](#工程化配置)

---

## 📱 移动端响应式设计

### 1. 移动端适配系统

#### 响应式设计 Hook

```typescript
// 移动端适配 Hook
const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth <= 768,
    isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
    isDesktop: window.innerWidth > 1024,
  });

  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    window.innerHeight > window.innerWidth ? "portrait" : "landscape"
  );

  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    // 监听窗口大小变化
    const handleResize = debounce(() => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      setScreenSize({
        width: newWidth,
        height: newHeight,
        isMobile: newWidth <= 768,
        isTablet: newWidth > 768 && newWidth <= 1024,
        isDesktop: newWidth > 1024,
      });

      setOrientation(newHeight > newWidth ? "portrait" : "landscape");
    }, 100);

    // 监听方向变化
    const handleOrientationChange = () => {
      setTimeout(() => {
        handleResize();
        updateSafeArea();
      }, 100);
    };

    // 更新安全区域
    const updateSafeArea = () => {
      if ("CSS" in window && "supports" in window.CSS) {
        const supports = window.CSS.supports;

        if (supports("padding-top: env(safe-area-inset-top)")) {
          const computedStyle = getComputedStyle(document.documentElement);

          setSafeArea({
            top: parseInt(computedStyle.getPropertyValue("--sat") || "0"),
            bottom: parseInt(computedStyle.getPropertyValue("--sab") || "0"),
            left: parseInt(computedStyle.getPropertyValue("--sal") || "0"),
            right: parseInt(computedStyle.getPropertyValue("--sar") || "0"),
          });
        }
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    // 初始化安全区域
    updateSafeArea();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  // 获取相对尺寸
  const getResponsiveSize = (
    size: number,
    type: "width" | "height" = "width"
  ) => {
    const baseSize = type === "width" ? 375 : 667; // iPhone 6/7/8 基准
    const currentSize = type === "width" ? screenSize.width : screenSize.height;
    return (size * currentSize) / baseSize;
  };

  // 检查是否为移动设备
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  // 检查是否支持触摸
  const isTouchDevice = () => {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  };

  return {
    screenSize,
    orientation,
    safeArea,
    getResponsiveSize,
    isMobileDevice: isMobileDevice(),
    isTouchDevice: isTouchDevice(),
    // 便捷属性
    ...screenSize,
  };
};
```

#### 响应式组件封装

```typescript
// 响应式容器组件
const ResponsiveContainer: React.FC<{
  children: ReactNode;
  maxWidth?: number;
  padding?: number;
  className?: string;
}> = ({ children, maxWidth = 1200, padding = 16, className = "" }) => {
  const { screenSize, safeArea } = useResponsive();

  const containerStyle: CSSProperties = {
    width: "100%",
    maxWidth: `${maxWidth}px`,
    margin: "0 auto",
    padding: `${padding}px`,
    paddingTop: `${padding + safeArea.top}px`,
    paddingBottom: `${padding + safeArea.bottom}px`,
    paddingLeft: `${padding + safeArea.left}px`,
    paddingRight: `${padding + safeArea.right}px`,
    minHeight: screenSize.isMobile ? "100vh" : "auto",
  };

  return (
    <div className={`responsive-container ${className}`} style={containerStyle}>
      {children}
    </div>
  );
};

// 响应式文本组件
const ResponsiveText: React.FC<{
  children: ReactNode;
  baseSize?: number;
  minSize?: number;
  maxSize?: number;
  weight?: "normal" | "bold" | number;
  className?: string;
}> = ({
  children,
  baseSize = 16,
  minSize = 12,
  maxSize = 24,
  weight = "normal",
  className = "",
}) => {
  const { getResponsiveSize, screenSize } = useResponsive();

  const fontSize = Math.min(
    Math.max(getResponsiveSize(baseSize), minSize),
    maxSize
  );

  const textStyle: CSSProperties = {
    fontSize: `${fontSize}px`,
    fontWeight: weight,
    lineHeight: 1.4,
    wordBreak: screenSize.isMobile ? "break-all" : "normal",
  };

  return (
    <span className={`responsive-text ${className}`} style={textStyle}>
      {children}
    </span>
  );
};

// 响应式按钮组件
const ResponsiveButton: React.FC<{
  children: ReactNode;
  onClick?: () => void;
  type?: "primary" | "default" | "dashed" | "text" | "link";
  size?: "large" | "middle" | "small";
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  className?: string;
}> = ({
  children,
  onClick,
  type = "default",
  size = "middle",
  disabled = false,
  loading = false,
  block = false,
  className = "",
}) => {
  const { screenSize, isTouchDevice } = useResponsive();

  // 移动端自动调整按钮尺寸
  const adjustedSize =
    screenSize.isMobile && size === "middle" ? "large" : size;

  const buttonStyle: CSSProperties = {
    minHeight: isTouchDevice ? "44px" : "auto", // 触摸友好的最小高度
    borderRadius: screenSize.isMobile ? "8px" : "6px",
    fontSize: screenSize.isMobile ? "16px" : "14px",
  };

  return (
    <Button
      type={type}
      size={adjustedSize}
      disabled={disabled}
      loading={loading}
      block={block || screenSize.isMobile}
      onClick={onClick}
      className={`responsive-button ${className}`}
      style={buttonStyle}
    >
      {children}
    </Button>
  );
};
```

### 2. CSS 移动端适配

#### PostCSS 配置

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    // 自动添加浏览器前缀
    autoprefixer: {
      overrideBrowserslist: [
        "Android 4.1",
        "iOS 7.1",
        "Chrome > 31",
        "ff > 31",
        "ie >= 8",
      ],
      grid: true,
    },

    // px 转 vw
    "postcss-px-to-viewport": {
      viewportWidth: 375, // 设计稿宽度
      viewportHeight: 667, // 设计稿高度
      unitPrecision: 3, // 转换后保留的小数位数
      viewportUnit: "vw", // 使用的视口单位
      selectorBlackList: [".ignore", ".hairlines"], // 不需要转换的类名
      minPixelValue: 1, // 小于或等于1px不转换
      mediaQuery: false, // 媒体查询中的px是否转换
      replace: true, // 是否替换属性值而不是添加备用属性
      exclude: [/node_modules/], // 排除文件夹
    },

    // 移动端1px问题解决
    "postcss-write-svg": {
      utf8: false,
    },

    // CSS压缩（生产环境）
    ...(process.env.NODE_ENV === "production"
      ? {
          cssnano: {
            preset: [
              "default",
              {
                discardComments: { removeAll: true },
                normalizeUnicode: false,
              },
            ],
          },
        }
      : {}),
  },
};
```

#### SCSS 变量和混合器

```scss
// styles/variables.scss
// 颜色变量
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #faad14;
$error-color: #ff4d4f;
$text-color: #262626;
$text-color-secondary: #8c8c8c;
$border-color: #e8e8e8;
$background-color: #f5f5f5;

// 尺寸变量
$header-height: 56px;
$footer-height: 60px;
$sidebar-width: 240px;
$content-max-width: 1200px;

// 断点变量
$mobile-breakpoint: 768px;
$tablet-breakpoint: 1024px;
$desktop-breakpoint: 1200px;

// Z-index 层级
$z-index-dropdown: 1000;
$z-index-sticky: 1020;
$z-index-fixed: 1030;
$z-index-modal-backdrop: 1040;
$z-index-modal: 1050;
$z-index-popover: 1060;
$z-index-tooltip: 1070;

// 动画变量
$transition-duration: 0.3s;
$transition-timing: cubic-bezier(0.4, 0, 0.2, 1);

// 移动端适配混合器
@mixin mobile {
  @media (max-width: $mobile-breakpoint) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: #{$mobile-breakpoint + 1px}) and (max-width: $tablet-breakpoint) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: #{$tablet-breakpoint + 1px}) {
    @content;
  }
}

// 响应式字体大小
@mixin responsive-font(
  $min-size,
  $max-size,
  $min-width: 320px,
  $max-width: 1200px
) {
  font-size: $min-size;

  @media (min-width: $min-width) and (max-width: $max-width) {
    font-size: calc(
      #{$min-size} + #{strip-unit($max-size - $min-size)} *
        ((100vw - #{$min-width}) / #{strip-unit($max-width - $min-width)})
    );
  }

  @media (min-width: $max-width) {
    font-size: $max-size;
  }
}

// 1px 边框解决方案
@mixin hairline($direction: all, $color: $border-color) {
  position: relative;

  &::after {
    content: "";
    position: absolute;
    background-color: $color;

    @if $direction == all {
      top: 0;
      left: 0;
      width: 200%;
      height: 200%;
      border: 1px solid $color;
      transform: scale(0.5);
      transform-origin: 0 0;
    } @else if $direction == top {
      top: 0;
      left: 0;
      width: 100%;
      height: 1px;
      transform: scaleY(0.5);
    } @else if $direction == bottom {
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      transform: scaleY(0.5);
    } @else if $direction == left {
      top: 0;
      left: 0;
      width: 1px;
      height: 100%;
      transform: scaleX(0.5);
    } @else if $direction == right {
      top: 0;
      right: 0;
      width: 1px;
      height: 100%;
      transform: scaleX(0.5);
    }
  }
}

// 安全区域适配
@mixin safe-area-padding($direction: all) {
  @if $direction == all {
    padding-top: constant(safe-area-inset-top);
    padding-top: env(safe-area-inset-top);
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: constant(safe-area-inset-left);
    padding-left: env(safe-area-inset-left);
    padding-right: constant(safe-area-inset-right);
    padding-right: env(safe-area-inset-right);
  } @else if $direction == top {
    padding-top: constant(safe-area-inset-top);
    padding-top: env(safe-area-inset-top);
  } @else if $direction == bottom {
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
  } @else if $direction == left {
    padding-left: constant(safe-area-inset-left);
    padding-left: env(safe-area-inset-left);
  } @else if $direction == right {
    padding-right: constant(safe-area-inset-right);
    padding-right: env(safe-area-inset-right);
  }
}

// 辅助函数
@function strip-unit($value) {
  @return $value / ($value * 0 + 1);
}
```

---

## 🤳 手势识别系统

### 1. 手势处理实现

```typescript
// 手势识别 Hook
const useGestures = (
  elementRef: RefObject<HTMLElement>,
  options: {
    onPan?: (deltaX: number, deltaY: number) => void;
    onZoom?: (scale: number) => void;
    onRotate?: (angle: number) => void;
    onGestureEnd?: () => void;
  } = {}
) => {
  const { onPan, onZoom, onRotate, onGestureEnd } = options;

  const [gestureState, setGestureState] = useState({
    isPanning: false,
    isZooming: false,
    isRotating: false,
    panDelta: { x: 0, y: 0 },
    zoomScale: 1,
    rotationAngle: 0,
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let initialDistance = 0;
    let initialAngle = 0;
    let initialTouches: Touch[] = [];
    let lastPanPosition = { x: 0, y: 0 };

    // 计算两点距离
    const getDistance = (touch1: Touch, touch2: Touch) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // 计算两点角度
    const getAngle = (touch1: Touch, touch2: Touch) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return (Math.atan2(dy, dx) * 180) / Math.PI;
    };

    // 触摸开始
    const handleTouchStart = (e: TouchEvent) => {
      const touches = Array.from(e.touches);
      initialTouches = touches;

      if (touches.length === 1) {
        // 单指平移
        const touch = touches[0];
        lastPanPosition = { x: touch.clientX, y: touch.clientY };
        setGestureState((prev) => ({ ...prev, isPanning: true }));
      } else if (touches.length === 2) {
        // 双指缩放/旋转
        initialDistance = getDistance(touches[0], touches[1]);
        initialAngle = getAngle(touches[0], touches[1]);
        setGestureState((prev) => ({
          ...prev,
          isZooming: true,
          isRotating: true,
          isPanning: false,
        }));
      }
    };

    // 触摸移动
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touches = Array.from(e.touches);

      if (touches.length === 1 && gestureState.isPanning) {
        // 平移处理
        const touch = touches[0];
        const deltaX = touch.clientX - lastPanPosition.x;
        const deltaY = touch.clientY - lastPanPosition.y;

        setGestureState((prev) => ({
          ...prev,
          panDelta: { x: deltaX, y: deltaY },
        }));

        lastPanPosition = { x: touch.clientX, y: touch.clientY };

        // 触发平移事件
        onPan?.(deltaX, deltaY);
      } else if (touches.length === 2) {
        // 缩放处理
        const currentDistance = getDistance(touches[0], touches[1]);
        const scale = currentDistance / initialDistance;

        setGestureState((prev) => ({
          ...prev,
          zoomScale: scale,
        }));

        // 旋转处理
        const currentAngle = getAngle(touches[0], touches[1]);
        const rotationDelta = currentAngle - initialAngle;

        setGestureState((prev) => ({
          ...prev,
          rotationAngle: rotationDelta,
        }));

        // 触发缩放和旋转事件
        onZoom?.(scale);
        onRotate?.(rotationDelta);
      }
    };

    // 触摸结束
    const handleTouchEnd = (e: TouchEvent) => {
      const touches = Array.from(e.touches);

      if (touches.length === 0) {
        // 所有触摸结束
        setGestureState({
          isPanning: false,
          isZooming: false,
          isRotating: false,
          panDelta: { x: 0, y: 0 },
          zoomScale: 1,
          rotationAngle: 0,
        });

        onGestureEnd?.();
      } else if (touches.length === 1 && gestureState.isZooming) {
        // 从双指变为单指
        const touch = touches[0];
        lastPanPosition = { x: touch.clientX, y: touch.clientY };
        setGestureState((prev) => ({
          ...prev,
          isPanning: true,
          isZooming: false,
          isRotating: false,
        }));
      }
    };

    // 添加事件监听器
    element.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [elementRef.current, onPan, onZoom, onRotate, onGestureEnd]);

  return gestureState;
};
```

### 2. 可手势操作的图片组件

```typescript
// 手势图片组件
const GestureImage: React.FC<{
  src: string;
  alt?: string;
  maxZoom?: number;
  minZoom?: number;
  onZoomChange?: (scale: number) => void;
  className?: string;
}> = ({
  src,
  alt = "",
  maxZoom = 3,
  minZoom = 0.5,
  onZoomChange,
  className = "",
}) => {
  const imageRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0,
    rotation: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // 手势处理回调
  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    setTransform((prev) => ({
      ...prev,
      translateX: prev.translateX + deltaX,
      translateY: prev.translateY + deltaY,
    }));
  }, []);

  const handleZoom = useCallback(
    (scale: number) => {
      const newScale = Math.min(Math.max(scale, minZoom), maxZoom);
      setTransform((prev) => ({
        ...prev,
        scale: newScale,
      }));
      onZoomChange?.(newScale);
    },
    [minZoom, maxZoom, onZoomChange]
  );

  const handleRotate = useCallback((angle: number) => {
    setTransform((prev) => ({
      ...prev,
      rotation: angle,
    }));
  }, []);

  const handleGestureEnd = useCallback(() => {
    // 边界检查和回弹
    setTransform((prev) => {
      const { scale, translateX, translateY } = prev;

      // 缩放边界检查
      const boundedScale = Math.min(Math.max(scale, minZoom), maxZoom);

      // 平移边界检查
      const container = imageRef.current;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const imageRect = {
          width: containerRect.width * boundedScale,
          height: containerRect.height * boundedScale,
        };

        const maxTranslateX = Math.max(
          0,
          (imageRect.width - containerRect.width) / 2
        );
        const maxTranslateY = Math.max(
          0,
          (imageRect.height - containerRect.height) / 2
        );

        const boundedTranslateX = Math.min(
          Math.max(translateX, -maxTranslateX),
          maxTranslateX
        );
        const boundedTranslateY = Math.min(
          Math.max(translateY, -maxTranslateY),
          maxTranslateY
        );

        return {
          ...prev,
          scale: boundedScale,
          translateX: boundedTranslateX,
          translateY: boundedTranslateY,
        };
      }

      return { ...prev, scale: boundedScale };
    });
  }, [minZoom, maxZoom]);

  // 使用手势识别
  const gestureState = useGestures(imageRef, {
    onPan: handlePan,
    onZoom: handleZoom,
    onRotate: handleRotate,
    onGestureEnd: handleGestureEnd,
  });

  // 重置变换
  const resetTransform = () => {
    setTransform({
      scale: 1,
      translateX: 0,
      translateY: 0,
      rotation: 0,
    });
  };

  // 双击缩放
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (transform.scale === 1) {
      setTransform((prev) => ({ ...prev, scale: 2 }));
    } else {
      resetTransform();
    }
  };

  const transformStyle = {
    transform: `
      translate(${transform.translateX}px, ${transform.translateY}px)
      scale(${transform.scale})
      rotate(${transform.rotation}deg)
    `,
    transition:
      gestureState.isPanning || gestureState.isZooming
        ? "none"
        : "transform 0.3s ease",
    transformOrigin: "center center",
  };

  return (
    <div
      ref={imageRef}
      className={`gesture-image-container ${className}`}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        touchAction: "none",
        userSelect: "none",
      }}
      onDoubleClick={handleDoubleClick}
    >
      {isLoading && (
        <div className="image-loading">
          <Spin size="large" />
        </div>
      )}

      {hasError && (
        <div className="image-error">
          <PictureOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
          <p>图片加载失败</p>
        </div>
      )}

      <img
        src={src}
        alt={alt}
        style={{
          ...transformStyle,
          display: isLoading || hasError ? "none" : "block",
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        draggable={false}
      />

      {/* 操作控件 */}
      <div className="image-controls">
        <Button
          type="default"
          icon={<ReloadOutlined />}
          onClick={resetTransform}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 10,
          }}
        >
          重置
        </Button>

        <div
          className="zoom-info"
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            background: "rgba(0, 0, 0, 0.5)",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        >
          {(transform.scale * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
};
```

---

## ⚡ 性能优化技术

### 1. 图片懒加载实现

```typescript
// 图片懒加载 Hook
const useLazyImage = (src: string, threshold = 0.1) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const imgElement = imgRef.current;
    if (!imgElement) return;

    // 创建 Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting) {
          // 图片进入视口，开始加载
          setImageSrc(src);
          observer.unobserve(imgElement);
        }
      },
      {
        threshold,
        rootMargin: "50px", // 提前50px开始加载
      }
    );

    observer.observe(imgElement);

    return () => {
      observer.disconnect();
    };
  }, [src, threshold]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  return {
    imgRef,
    src: imageSrc,
    isLoading,
    hasError,
    onLoad: handleLoad,
    onError: handleError,
  };
};

// 懒加载图片组件
const LazyImage: React.FC<{
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  placeholder?: ReactNode;
  errorPlaceholder?: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}> = ({
  src,
  alt = "",
  width,
  height,
  placeholder,
  errorPlaceholder,
  className = "",
  style = {},
  onClick,
}) => {
  const {
    imgRef,
    src: imageSrc,
    isLoading,
    hasError,
    onLoad,
    onError,
  } = useLazyImage(src);

  const imageStyle: CSSProperties = {
    width,
    height,
    objectFit: "cover",
    ...style,
  };

  return (
    <div
      className={`lazy-image-container ${className}`}
      style={{ position: "relative", width, height }}
      onClick={onClick}
    >
      {/* 占位符 */}
      {isLoading && (
        <div className="image-placeholder" style={imageStyle}>
          {placeholder || (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f5f5f5",
                color: "#d9d9d9",
                ...imageStyle,
              }}
            >
              <PictureOutlined style={{ fontSize: 24 }} />
            </div>
          )}
        </div>
      )}

      {/* 错误占位符 */}
      {hasError && (
        <div className="image-error" style={imageStyle}>
          {errorPlaceholder || (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#f5f5f5",
                color: "#d9d9d9",
                ...imageStyle,
              }}
            >
              <PictureOutlined style={{ fontSize: 24 }} />
              <span style={{ fontSize: 12, marginTop: 4 }}>加载失败</span>
            </div>
          )}
        </div>
      )}

      {/* 实际图片 */}
      <img
        ref={imgRef}
        src={imageSrc || ""}
        alt={alt}
        style={{
          ...imageStyle,
          display: isLoading || hasError ? "none" : "block",
        }}
        onLoad={onLoad}
        onError={onError}
      />

      {/* 加载进度指示器 */}
      {isLoading && imageSrc && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          <Spin size="small" />
        </div>
      )}
    </div>
  );
};
```

### 2. 虚拟滚动列表

```typescript
// 虚拟滚动列表组件
const VirtualScrollList: React.FC<{
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => ReactNode;
  overscan?: number;
  className?: string;
}> = ({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = "",
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 计算可见范围
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  );

  // 计算渲染范围（包含overscan）
  const renderStart = Math.max(0, visibleStart - overscan);
  const renderEnd = Math.min(items.length - 1, visibleEnd + overscan);

  // 渲染的项目
  const visibleItems = [];
  for (let i = renderStart; i <= renderEnd; i++) {
    visibleItems.push({
      index: i,
      item: items[i],
      style: {
        position: "absolute" as const,
        top: i * itemHeight,
        left: 0,
        right: 0,
        height: itemHeight,
      },
    });
  }

  // 处理滚动
  const handleScroll = useCallback(
    throttle((e: Event) => {
      const target = e.target as HTMLDivElement;
      setScrollTop(target.scrollTop);
    }, 16), // 60fps
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <div
      ref={containerRef}
      className={`virtual-scroll-list ${className}`}
      style={{
        height: containerHeight,
        overflow: "auto",
        position: "relative",
      }}
    >
      {/* 虚拟容器 - 用于维持滚动条高度 */}
      <div style={{ height: items.length * itemHeight, position: "relative" }}>
        {/* 渲染可见项目 */}
        {visibleItems.map(({ index, item, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 3. 预加载策略

```typescript
// 资源预加载管理器
class ResourcePreloader {
  private cache: Map<string, any> = new Map();
  private loading: Set<string> = new Set();
  private maxCacheSize = 50;

  // 预加载图片
  async preloadImage(url: string): Promise<HTMLImageElement> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    if (this.loading.has(url)) {
      // 如果正在加载，等待加载完成
      return new Promise((resolve) => {
        const checkLoading = () => {
          if (!this.loading.has(url)) {
            resolve(this.cache.get(url));
          } else {
            setTimeout(checkLoading, 50);
          }
        };
        checkLoading();
      });
    }

    this.loading.add(url);

    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.loading.delete(url);
        this.setCache(url, img);
        resolve(img);
      };

      img.onerror = () => {
        this.loading.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };

      img.src = url;
    });
  }

  // 预加载音频
  async preloadAudio(url: string): Promise<HTMLAudioElement> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio();

      audio.oncanplaythrough = () => {
        this.setCache(url, audio);
        resolve(audio);
      };

      audio.onerror = () => {
        reject(new Error(`Failed to load audio: ${url}`));
      };

      audio.src = url;
      audio.load();
    });
  }

  // 预加载JSON数据
  async preloadData(url: string): Promise<any> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    try {
      const response = await fetch(url);
      const data = await response.json();
      this.setCache(url, data);
      return data;
    } catch (error) {
      throw new Error(`Failed to load data: ${url}`);
    }
  }

  // 批量预加载
  async preloadBatch(
    urls: string[],
    type: "image" | "audio" | "data" = "image"
  ): Promise<any[]> {
    const promises = urls.map((url) => {
      switch (type) {
        case "image":
          return this.preloadImage(url);
        case "audio":
          return this.preloadAudio(url);
        case "data":
          return this.preloadData(url);
        default:
          return Promise.reject(new Error(`Unknown type: ${type}`));
      }
    });

    try {
      return await Promise.all(promises);
    } catch (error) {
      console.warn("Batch preload failed:", error);
      // 部分失败时返回成功加载的资源
      const results = await Promise.allSettled(promises);
      return results
        .filter((result) => result.status === "fulfilled")
        .map((result) => (result as PromiseFulfilledResult<any>).value);
    }
  }

  // 缓存管理
  private setCache(key: string, value: any) {
    // 如果缓存已满，删除最旧的项目
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
  }

  // 清除缓存
  clearCache() {
    this.cache.clear();
    this.loading.clear();
  }

  // 获取缓存大小
  getCacheSize() {
    return this.cache.size;
  }

  // 检查资源是否已缓存
  isCached(url: string) {
    return this.cache.has(url);
  }
}

// 全局预加载器实例
export const resourcePreloader = new ResourcePreloader();

// 预加载 Hook
const usePreloader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const preloadResources = useCallback(
    async (urls: string[], type: "image" | "audio" | "data" = "image") => {
      setIsLoading(true);
      setProgress(0);

      try {
        let completed = 0;

        const promises = urls.map(async (url) => {
          try {
            await resourcePreloader.preloadBatch([url], type);
            completed++;
            setProgress((completed / urls.length) * 100);
          } catch (error) {
            console.warn(`Failed to preload ${url}:`, error);
            completed++;
            setProgress((completed / urls.length) * 100);
          }
        });

        await Promise.all(promises);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    progress,
    preloadResources,
    clearCache: resourcePreloader.clearCache.bind(resourcePreloader),
    getCacheSize: resourcePreloader.getCacheSize.bind(resourcePreloader),
  };
};
```

---

_这样我们就完成了移动端优化和工程化配置的详细说明。这些技术实现涵盖了响应式设计、手势识别、性能优化、工程化配置等各个方面，为开发者提供了完整的移动端应用开发指南。_
