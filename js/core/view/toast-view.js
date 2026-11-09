/**
 * ==============================================================================
 * EDUMARKET - MAIN JAVASCRIPT LOGIC
 * Chức năng: Xử lý Toast UI, Header, Mini-Cart, User Session & Render Card Hàng hóa
 * ==============================================================================
 */

// ==============================================================================
// 1. TOAST NOTIFICATION SYSTEM
// ==============================================================================
const Toast = {
  containerId: "toast-container",

  getContainer() {
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = this.containerId;
      document.body.appendChild(container);
    }
    return container;
  },

  show(type, title, message, duration = 3500) {
    const container = this.getContainer();

    const icons = {
      success: "fa-solid fa-circle-check",
      error: "fa-solid fa-circle-xmark",
      warning: "fa-solid fa-triangle-exclamation",
      info: "fa-solid fa-circle-info"
    };

    const iconClass = icons[type] || icons.info;

    const toastEl = document.createElement("div");
    toastEl.className = `toast toast-${type}`;
    toastEl.innerHTML = `
      <div class="toast-icon">
        <i class="${iconClass}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <div class="toast-close" title="Đóng">
        <i class="fa-solid fa-xmark"></i>
      </div>
      <div class="toast-progress">
        <div class="toast-progress-bar"></div>
      </div>
    `;

    container.appendChild(toastEl);

    requestAnimationFrame(() => {
      toastEl.classList.add("toast-show");
    });

    const progressBar = toastEl.querySelector(".toast-progress-bar");
    if (progressBar) {
      progressBar.style.transition = `width ${duration}ms linear`;
      requestAnimationFrame(() => {
        progressBar.style.width = "0%";
      });
    }

    let hideTimeout;
    const removeToast = () => {
      clearTimeout(hideTimeout);
      toastEl.classList.remove("toast-show");
      toastEl.classList.add("toast-hide");
      setTimeout(() => {
        if (toastEl.parentNode) {
          toastEl.parentNode.removeChild(toastEl);
        }
      }, 400);
    };

    hideTimeout = setTimeout(removeToast, duration);

    const closeBtn = toastEl.querySelector(".toast-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", removeToast);
    }
  },

  success(title, message, duration) {
    this.show("success", title, message, duration);
  },

  error(title, message, duration) {
    this.show("error", title, message, duration);
  },

  warning(title, message, duration) {
    this.show("warning", title, message, duration);
  },

  info(title, message, duration) {
    this.show("info", title, message, duration);
  }
};
