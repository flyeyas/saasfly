# HTML5游戏网站 UI设计系统

## 1. 设计理念

### 核心设计原则
- **现代简约**：采用扁平化设计，减少视觉噪音
- **游戏化体验**：融入游戏元素，提升趣味性
- **响应式优先**：移动端优先的设计思路
- **可访问性**：确保良好的对比度和可读性

### 目标用户体验
- 快速找到感兴趣的游戏
- 流畅的游戏体验
- 清晰的信息层级
- 愉悦的视觉感受

## 2. 色彩系统

### 主色调
```css
/* 主品牌色 - 游戏蓝 */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* 主色 */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;

/* 辅助色 - 活力橙 */
--secondary-50: #fff7ed;
--secondary-100: #ffedd5;
--secondary-200: #fed7aa;
--secondary-300: #fdba74;
--secondary-400: #fb923c;
--secondary-500: #f97316;  /* 辅助色 */
--secondary-600: #ea580c;
--secondary-700: #c2410c;
--secondary-800: #9a3412;
--secondary-900: #7c2d12;
```

### 功能色彩
```css
/* 成功色 */
--success-500: #10b981;
--success-100: #d1fae5;

/* 警告色 */
--warning-500: #f59e0b;
--warning-100: #fef3c7;

/* 错误色 */
--error-500: #ef4444;
--error-100: #fee2e2;

/* 信息色 */
--info-500: #06b6d4;
--info-100: #cffafe;
```

### 中性色彩
```css
/* 灰度系统 */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

## 3. 字体系统

### 字体族
```css
/* 主字体 - 系统字体栈 */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;

/* 等宽字体 */
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, 'Liberation Mono', Menlo, Courier, monospace;

/* 游戏标题字体 */
--font-game: 'Orbitron', 'Exo 2', sans-serif;
```

### 字体大小
```css
/* 字体尺寸系统 */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
```

### 字重
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

## 4. 间距系统

### 基础间距
```css
/* 8px 基础单位系统 */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

## 5. 圆角系统

```css
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius-base: 0.25rem;  /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-3xl: 1.5rem;    /* 24px */
--radius-full: 9999px;
```

## 6. 阴影系统

```css
/* 阴影层级 */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

/* 游戏卡片特殊阴影 */
--shadow-game-card: 0 4px 20px rgb(59 130 246 / 0.15);
--shadow-game-card-hover: 0 8px 30px rgb(59 130 246 / 0.25);
```

## 7. 组件设计规范

### 按钮组件
```css
/* 主要按钮 */
.btn-primary {
  background: var(--primary-500);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* 次要按钮 */
.btn-secondary {
  background: var(--secondary-500);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
}

/* 轮廓按钮 */
.btn-outline {
  background: transparent;
  color: var(--primary-500);
  border: 2px solid var(--primary-500);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
}
```

### 游戏卡片组件
```css
.game-card {
  background: white;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-game-card);
  transition: all 0.3s ease;
}

.game-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-game-card-hover);
}

.game-card-image {
  aspect-ratio: 16/9;
  object-fit: cover;
  width: 100%;
}

.game-card-content {
  padding: var(--space-4);
}

.game-card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
  margin-bottom: var(--space-2);
}

.game-card-description {
  font-size: var(--text-sm);
  color: var(--gray-600);
  line-height: 1.5;
}
```

### 导航组件
```css
.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--gray-200);
  padding: var(--space-4) 0;
}

.nav-link {
  color: var(--gray-700);
  font-weight: var(--font-medium);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--primary-600);
  background: var(--primary-50);
}

.nav-link.active {
  color: var(--primary-600);
  background: var(--primary-100);
}
```

## 8. 图标系统

### 图标库选择
- **主要图标库**: Font Awesome 6 (免费版)
- **游戏相关图标**: Gaming Icons
- **自定义图标**: SVG 格式，24x24px 基础尺寸

### 图标使用规范
```css
/* 图标尺寸 */
.icon-xs { font-size: 12px; }
.icon-sm { font-size: 16px; }
.icon-base { font-size: 20px; }
.icon-lg { font-size: 24px; }
.icon-xl { font-size: 32px; }

/* 图标颜色 */
.icon-primary { color: var(--primary-500); }
.icon-secondary { color: var(--secondary-500); }
.icon-muted { color: var(--gray-400); }
```

## 9. 响应式断点

```css
/* 移动端优先的断点系统 */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

## 10. 动画系统

### 基础动画
```css
/* 缓动函数 */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);

/* 动画时长 */
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;

/* 常用动画 */
.fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.slide-up {
  animation: slideUp var(--duration-normal) var(--ease-out);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

## 11. 真实图片资源

### 游戏截图来源
- **Unsplash**: 高质量游戏相关图片
- **Pexels**: 免费游戏和科技图片
- **游戏官方素材**: 经典游戏截图

### 推荐图片尺寸
- **游戏卡片**: 400x225px (16:9)
- **游戏详情横幅**: 1200x675px (16:9)
- **游戏截图**: 800x450px (16:9)
- **用户头像**: 64x64px (1:1)

### 图片优化
- 使用 WebP 格式优先
- 提供多种尺寸的响应式图片
- 添加适当的 alt 文本
- 使用懒加载优化性能

## 12. 可访问性规范

### 颜色对比度
- 正文文字: 至少 4.5:1
- 大文字 (18px+): 至少 3:1
- 非文字元素: 至少 3:1

### 键盘导航
- 所有交互元素可通过 Tab 键访问
- 清晰的焦点指示器
- 合理的 Tab 顺序

### 屏幕阅读器
- 语义化的 HTML 结构
- 适当的 ARIA 标签
- 有意义的链接文本

这个设计系统将确保我们的HTML5游戏网站具有一致、现代、可访问的用户界面。