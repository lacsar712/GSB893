import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Toast通知函数 - 现代未来感设计
export const toast = {
  success: (message) => {
    showToast(message, 'success');
  },
  error: (message) => {
    showToast(message, 'error');
  },
  info: (message) => {
    showToast(message, 'info');
  },
};

function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container') || createToastContainer();
  
  const toast = document.createElement('div');
  toast.className = 'toast-item animate-toast-in';
  
  // 现代未来感样式配置
  const configs = {
    success: {
      gradient: 'from-emerald-500 via-cyan-500 to-blue-500',
      icon: '✓',
      borderColor: 'border-emerald-400/50',
      glowColor: 'shadow-emerald-400/50',
    },
    error: {
      gradient: 'from-red-500 via-pink-500 to-purple-500',
      icon: '✕',
      borderColor: 'border-red-400/50',
      glowColor: 'shadow-red-400/50',
    },
    info: {
      gradient: 'from-cyan-500 via-blue-500 to-purple-500',
      icon: 'ℹ',
      borderColor: 'border-cyan-400/50',
      glowColor: 'shadow-cyan-400/50',
    },
  };
  
  const config = configs[type];
  
  toast.innerHTML = `
    <div class="relative group">
      <!-- 外层发光效果 -->
      <div class="absolute -inset-0.5 bg-gradient-to-r ${config.gradient} rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
      
      <!-- 主容器 -->
      <div class="relative flex items-center gap-3 px-5 py-3.5 rounded-xl bg-slate-900/95 backdrop-blur-xl border ${config.borderColor} ${config.glowColor} shadow-2xl">
        <!-- 图标 -->
        <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg">
          ${config.icon}
        </div>
        
        <!-- 消息文本 -->
        <span class="text-white font-medium text-sm flex-1">${message}</span>
        
        <!-- 进度条 -->
        <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${config.gradient} rounded-b-xl animate-toast-progress origin-left"></div>
        
        <!-- 闪烁指示器 -->
        <div class="w-2 h-2 rounded-full bg-gradient-to-r ${config.gradient} animate-pulse"></div>
      </div>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  // 3秒后移除
  setTimeout(() => {
    toast.classList.remove('animate-toast-in');
    toast.classList.add('animate-toast-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none';
  container.style.maxWidth = '420px';
  document.body.appendChild(container);
  
  // 添加现代动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes toast-in {
      from {
        transform: translateX(120%) scale(0.8);
        opacity: 0;
      }
      to {
        transform: translateX(0) scale(1);
        opacity: 1;
      }
    }
    
    @keyframes toast-out {
      from {
        transform: translateX(0) scale(1);
        opacity: 1;
      }
      to {
        transform: translateX(120%) scale(0.8);
        opacity: 0;
      }
    }
    
    @keyframes toast-progress {
      from {
        transform: scaleX(1);
      }
      to {
        transform: scaleX(0);
      }
    }
    
    .toast-item {
      pointer-events: auto;
    }
    
    .animate-toast-in {
      animation: toast-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .animate-toast-out {
      animation: toast-out 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .animate-toast-progress {
      animation: toast-progress 3s linear;
    }
  `;
  document.head.appendChild(style);
  
  return container;
}
