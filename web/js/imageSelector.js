import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

/**
 * ComfyUI Image Selector - 前端图片选择弹窗
 * 弹出图片选择界面，支持多选、全选/反选、大图预览、提示音
 */

// ============================
// 样式注入
// ============================
const STYLES = `
/* ===== 遮罩层 ===== */
.image-selector-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: isOverlayFadeIn 0.3s ease-out;
}

@keyframes isOverlayFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* ===== 弹窗主体 ===== */
.image-selector-dialog {
    background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6),
                0 0 40px rgba(83, 92, 236, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.08);
    width: 92vw;
    max-width: 1400px;
    max-height: 92vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: isDialogSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes isDialogSlideIn {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(30px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

/* ===== 头部 ===== */
.image-selector-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 28px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(0, 0, 0, 0.2);
    flex-shrink: 0;
}

.image-selector-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 18px;
    font-weight: 700;
    color: #e8e8ff;
    letter-spacing: 0.5px;
}

.image-selector-title-icon {
    font-size: 24px;
    filter: drop-shadow(0 0 6px rgba(83, 92, 236, 0.5));
}

.image-selector-badge {
    background: linear-gradient(135deg, #535cec, #7c4dff);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
    letter-spacing: 0.3px;
}

.image-selector-header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.image-selector-mode-label {
    color: rgba(255, 255, 255, 0.5);
    font-size: 13px;
    margin-right: 4px;
}

/* ===== 倒计时 ===== */
.image-selector-countdown {
    display: flex;
    align-items: center;
    gap: 10px;
}

.image-selector-countdown-text {
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    min-width: 50px;
    text-align: right;
}

.image-selector-countdown-text.warning {
    color: #ff9800;
}

.image-selector-countdown-text.danger {
    color: #ff4444;
    animation: isCountdownPulse 1s ease-in-out infinite;
}

@keyframes isCountdownPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.image-selector-countdown-bar {
    width: 120px;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.1);
    overflow: hidden;
}

.image-selector-countdown-bar-fill {
    height: 100%;
    border-radius: 2px;
    background: linear-gradient(90deg, #535cec, #7c4dff);
    transition: width 1s linear, background 0.3s ease;
}

.image-selector-countdown-bar-fill.warning {
    background: linear-gradient(90deg, #ff9800, #ffc107);
}

.image-selector-countdown-bar-fill.danger {
    background: linear-gradient(90deg, #ff4444, #ff6b6b);
}

/* ===== 工具栏 ===== */
.image-selector-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 28px;
    background: rgba(0, 0, 0, 0.15);
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    flex-shrink: 0;
}

.image-selector-toolbar-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.image-selector-toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

/* ===== 卡片大小滑块 ===== */
.image-selector-size-slider {
    display: flex;
    align-items: center;
    gap: 8px;
}

.image-selector-size-slider label {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    white-space: nowrap;
}

.image-selector-size-slider input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100px;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.12);
    outline: none;
    cursor: pointer;
}

.image-selector-size-slider input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: linear-gradient(135deg, #535cec, #7c4dff);
    border: 2px solid rgba(255, 255, 255, 0.3);
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.image-selector-size-slider input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 0 8px rgba(83, 92, 236, 0.6);
}

.image-selector-size-slider input[type="range"]::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: linear-gradient(135deg, #535cec, #7c4dff);
    border: 2px solid rgba(255, 255, 255, 0.3);
    cursor: pointer;
}

.image-selector-size-slider input[type="range"]::-moz-range-track {
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.12);
}

.image-selector-btn-sm {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    padding: 6px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.image-selector-btn-sm:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
}

.image-selector-count {
    color: rgba(255, 255, 255, 0.5);
    font-size: 13px;
    font-weight: 500;
}

.image-selector-count span {
    color: #7c8dff;
    font-weight: 700;
}

/* ===== 图片网格 ===== */
.image-selector-grid {
    flex: 1;
    overflow-y: auto;
    padding: 20px 28px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--card-min-width, 320px), 1fr));
    gap: 20px;
    align-content: start;
}

.image-selector-grid::-webkit-scrollbar {
    width: 6px;
}

.image-selector-grid::-webkit-scrollbar-track {
    background: transparent;
}

.image-selector-grid::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
}

.image-selector-grid::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
}

/* ===== 图片卡片 ===== */
.image-selector-card {
    position: relative;
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    border: 2px solid rgba(255, 255, 255, 0.06);
    background: rgba(0, 0, 0, 0.3);
}

.image-selector-card:hover {
    transform: translateY(-4px) scale(1.01);
    border-color: rgba(83, 92, 236, 0.4);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4),
                0 0 20px rgba(83, 92, 236, 0.15);
}

.image-selector-card.selected {
    border-color: #535cec;
    box-shadow: 0 0 0 3px rgba(83, 92, 236, 0.3),
                0 8px 25px rgba(83, 92, 236, 0.25);
}

.image-selector-card.selected::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(83, 92, 236, 0.08) 0%, rgba(83, 92, 236, 0.2) 100%);
    pointer-events: none;
}

.image-selector-card-img-wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.2);
    overflow: hidden;
}

.image-selector-card img {
    width: 100%;
    height: auto;
    max-height: 400px;
    object-fit: contain;
    transition: transform 0.4s ease;
    display: block;
}

.image-selector-card:hover img {
    transform: scale(1.03);
}

/* ===== 复选框 ===== */
.image-selector-checkbox {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.4);
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s ease;
    z-index: 2;
}

.image-selector-card.selected .image-selector-checkbox {
    background: linear-gradient(135deg, #535cec, #7c4dff);
    border-color: transparent;
    box-shadow: 0 2px 10px rgba(83, 92, 236, 0.5);
}

.image-selector-checkbox-icon {
    opacity: 0;
    transform: scale(0.5);
    transition: all 0.25s ease;
    color: #fff;
    font-size: 14px;
    font-weight: 800;
    line-height: 1;
}

.image-selector-card.selected .image-selector-checkbox-icon {
    opacity: 1;
    transform: scale(1);
}

/* ===== 图片信息栏 ===== */
.image-selector-card-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.4);
}

.image-selector-index {
    color: rgba(255, 255, 255, 0.85);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.3px;
}

.image-selector-size {
    color: rgba(255, 255, 255, 0.5);
    font-size: 11px;
    font-weight: 500;
}

/* ===== 放大按钮 ===== */
.image-selector-zoom-btn {
    position: absolute;
    top: 10px;
    left: 10px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    color: rgba(255, 255, 255, 0.7);
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 2;
    opacity: 0;
}

.image-selector-card:hover .image-selector-zoom-btn {
    opacity: 1;
}

.image-selector-zoom-btn:hover {
    background: rgba(83, 92, 236, 0.7);
    color: #fff;
    transform: scale(1.1);
}

/* ===== 底部操作栏 ===== */
.image-selector-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 28px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(0, 0, 0, 0.25);
    flex-shrink: 0;
}

.image-selector-footer-info {
    color: rgba(255, 255, 255, 0.4);
    font-size: 12px;
}

.image-selector-footer-buttons {
    display: flex;
    gap: 10px;
}

.image-selector-btn-cancel {
    background: rgba(255, 70, 70, 0.15);
    border: 1px solid rgba(255, 70, 70, 0.3);
    color: rgba(255, 120, 120, 0.9);
    padding: 10px 24px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.25s ease;
}

.image-selector-btn-cancel:hover {
    background: rgba(255, 70, 70, 0.25);
    border-color: rgba(255, 70, 70, 0.5);
    color: #ff8888;
}

.image-selector-btn-confirm {
    background: linear-gradient(135deg, #535cec, #7c4dff);
    border: none;
    color: #fff;
    padding: 10px 28px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.25s ease;
    box-shadow: 0 4px 15px rgba(83, 92, 236, 0.35);
    letter-spacing: 0.3px;
}

.image-selector-btn-confirm:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(83, 92, 236, 0.5);
}

.image-selector-btn-confirm:active {
    transform: translateY(0);
}

.image-selector-btn-confirm:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

/* ===== 加载状态 ===== */
.image-selector-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    gap: 16px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
}

.image-selector-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #535cec;
    border-radius: 50%;
    animation: isSpinnerRotate 0.8s linear infinite;
}

@keyframes isSpinnerRotate {
    to { transform: rotate(360deg); }
}

/* ===== 图片预览大图 ===== */
.image-selector-preview-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.92);
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: zoom-out;
    animation: isOverlayFadeIn 0.2s ease-out;
}

.image-selector-preview-overlay img {
    max-width: 95vw;
    max-height: 95vh;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

.image-selector-preview-close {
    position: absolute;
    top: 20px;
    right: 24px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.image-selector-preview-close:hover {
    background: rgba(255, 70, 70, 0.5);
    border-color: rgba(255, 70, 70, 0.6);
}

.image-selector-preview-info {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    color: rgba(255, 255, 255, 0.8);
    padding: 8px 20px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
    .image-selector-dialog {
        width: 98vw;
        max-height: 95vh;
        border-radius: 14px;
    }
    .image-selector-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
        padding: 14px;
    }
    .image-selector-card img {
        max-height: 280px;
    }
    .image-selector-header,
    .image-selector-toolbar,
    .image-selector-footer {
        padding-left: 16px;
        padding-right: 16px;
    }
}

/* ===== Toast 提示 ===== */
.image-selector-toast {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border: 1px solid rgba(255, 160, 0, 0.3);
    border-radius: 12px;
    padding: 14px 24px;
    color: #ffc107;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 160, 0, 0.1);
    z-index: 100001;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: isToastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    max-width: 500px;
}

.image-selector-toast.fade-out {
    animation: isToastOut 0.3s ease-in forwards;
}

@keyframes isToastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

@keyframes isToastOut {
    from { opacity: 1; transform: translateX(-50%) translateY(0); }
    to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
}

.image-selector-toast-icon {
    font-size: 18px;
    flex-shrink: 0;
}
`;

// ============================
// 注入样式
// ============================
function injectStyles() {
    if (document.getElementById("image-selector-styles")) return;
    const styleEl = document.createElement("style");
    styleEl.id = "image-selector-styles";
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);
}

// ============================
// Toast 提示
// ============================
function showToast(message, duration = 5000) {
    injectStyles();
    
    const toast = document.createElement("div");
    toast.className = "image-selector-toast";
    toast.innerHTML = `<span class="image-selector-toast-icon">⚠️</span><span>${message}</span>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add("fade-out");
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============================
// 提示音播放
// ============================
function playNotificationSound(soundFile, volume) {
    try {
        const audio = new Audio(`/image_selector/sound/${soundFile}`);
        audio.volume = Math.max(0, Math.min(1, volume));
        audio.play().catch(err => {
            console.warn("[Image Selector] 提示音播放失败:", err.message);
        });
    } catch (err) {
        console.warn("[Image Selector] 提示音加载失败:", err.message);
    }
}

// ============================
// 图片选择弹窗类
// ============================
class ImageSelectorDialog {
    constructor(sessionId, totalImages, nodeId, soundEnabled, soundVolume, soundFile, timeout) {
        this.sessionId = sessionId;
        this.totalImages = totalImages;
        this.nodeId = nodeId;
        this.soundEnabled = soundEnabled;
        this.soundVolume = soundVolume;
        this.soundFile = soundFile;
        this.timeout = timeout || 300;
        this.remainingTime = this.timeout;
        this.countdownTimer = null;
        this.selectedIndices = new Set();
        this.images = [];
        this.overlay = null;
        this.cardSize = 320; // 默认卡片最小宽度
    }

    async show() {
        injectStyles();
        
        // 播放提示音
        if (this.soundEnabled) {
            playNotificationSound(this.soundFile, this.soundVolume);
        }
        
        // 创建遮罩层
        this.overlay = document.createElement("div");
        this.overlay.className = "image-selector-overlay";
        
        // 创建弹窗
        const dialog = document.createElement("div");
        dialog.className = "image-selector-dialog";
        
        // 头部
        dialog.appendChild(this._createHeader());
        
        // 内容区域（先显示加载）
        this.contentEl = document.createElement("div");
        this.contentEl.className = "image-selector-grid";
        this.contentEl.innerHTML = `
            <div class="image-selector-loading" style="grid-column: 1 / -1;">
                <div class="image-selector-spinner"></div>
                <span>正在加载图片...</span>
            </div>
        `;
        dialog.appendChild(this.contentEl);
        
        // 底部
        this.footerEl = this._createFooter();
        dialog.appendChild(this.footerEl);
        
        this.overlay.appendChild(dialog);
        document.body.appendChild(this.overlay);
        
        // 加载图片
        await this._loadImages();
        
        // 启动倒计时
        this._startCountdown();
    }

    _createHeader() {
        const header = document.createElement("div");
        header.className = "image-selector-header";
        
        header.innerHTML = `
            <div class="image-selector-title">
                <span class="image-selector-title-icon">🖼️</span>
                <span>图片选择器</span>
                <span class="image-selector-badge">请选择需要的图片</span>
            </div>
            <div class="image-selector-header-actions">
                <span class="image-selector-mode-label">共 ${this.totalImages} 张图片</span>
                <div class="image-selector-countdown">
                    <div class="image-selector-countdown-bar">
                        <div class="image-selector-countdown-bar-fill" id="is-countdown-bar" style="width: 100%;"></div>
                    </div>
                    <span class="image-selector-countdown-text" id="is-countdown-text">${this._formatTime(this.timeout)}</span>
                </div>
            </div>
        `;
        
        return header;
    }

    _formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    _startCountdown() {
        this.remainingTime = this.timeout;
        const warningThreshold = Math.ceil(this.timeout * 0.3); // 剩余 30% 时变橙色
        const dangerThreshold = Math.ceil(this.timeout * 0.1);  // 剩余 10% 时变红色
        
        this.countdownTimer = setInterval(() => {
            this.remainingTime--;
            
            if (this.remainingTime <= 0) {
                this._stopCountdown();
                this._cancel(); // 超时自动取消
                return;
            }
            
            // 更新文字
            const textEl = this.overlay?.querySelector("#is-countdown-text");
            const barEl = this.overlay?.querySelector("#is-countdown-bar");
            
            if (textEl) {
                textEl.textContent = this._formatTime(this.remainingTime);
                textEl.className = "image-selector-countdown-text";
                if (this.remainingTime <= dangerThreshold) {
                    textEl.classList.add("danger");
                } else if (this.remainingTime <= warningThreshold) {
                    textEl.classList.add("warning");
                }
            }
            
            // 更新进度条
            if (barEl) {
                const pct = (this.remainingTime / this.timeout) * 100;
                barEl.style.width = `${pct}%`;
                barEl.className = "image-selector-countdown-bar-fill";
                if (this.remainingTime <= dangerThreshold) {
                    barEl.classList.add("danger");
                } else if (this.remainingTime <= warningThreshold) {
                    barEl.classList.add("warning");
                }
            }
        }, 1000);
    }

    _stopCountdown() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
    }

    _createToolbar() {
        const toolbar = document.createElement("div");
        toolbar.className = "image-selector-toolbar";
        
        toolbar.innerHTML = `
            <div class="image-selector-toolbar-left">
                <button class="image-selector-btn-sm" id="is-select-all">全选</button>
                <button class="image-selector-btn-sm" id="is-deselect-all">取消全选</button>
                <button class="image-selector-btn-sm" id="is-invert-select">反选</button>
            </div>
            <div class="image-selector-toolbar-right">
                <div class="image-selector-size-slider">
                    <label>🔲</label>
                    <input type="range" id="is-card-size" min="150" max="600" value="${this.cardSize}" step="10" />
                </div>
                <span class="image-selector-count">已选择 <span id="is-selected-count">0</span> / ${this.totalImages}</span>
            </div>
        `;
        
        // 绑定工具栏事件
        setTimeout(() => {
            const selectAllBtn = toolbar.querySelector("#is-select-all");
            const deselectAllBtn = toolbar.querySelector("#is-deselect-all");
            const invertBtn = toolbar.querySelector("#is-invert-select");
            const sizeSlider = toolbar.querySelector("#is-card-size");
            
            selectAllBtn.addEventListener("click", () => this._selectAll());
            deselectAllBtn.addEventListener("click", () => this._deselectAll());
            invertBtn.addEventListener("click", () => this._invertSelection());
            sizeSlider.addEventListener("input", (e) => this._onCardSizeChange(parseInt(e.target.value)));
        }, 0);
        
        return toolbar;
    }

    _createFooter() {
        const footer = document.createElement("div");
        footer.className = "image-selector-footer";
        
        footer.innerHTML = `
            <div class="image-selector-footer-info">
                💡 点击选择图片，点击 🔍 按钮或双击查看大图 | ⚠️ 取消或不选择将中断工作流
            </div>
            <div class="image-selector-footer-buttons">
                <button class="image-selector-btn-cancel" id="is-cancel-btn">✕ 取消（中断工作流）</button>
                <button class="image-selector-btn-confirm" id="is-confirm-btn" disabled>✓ 确认选择</button>
            </div>
        `;
        
        // 绑定按钮事件
        setTimeout(() => {
            footer.querySelector("#is-cancel-btn").addEventListener("click", () => this._cancel());
            footer.querySelector("#is-confirm-btn").addEventListener("click", () => this._confirm());
        }, 0);
        
        return footer;
    }

    async _loadImages() {
        try {
            const resp = await api.fetchApi("/image_selector/get_images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id: this.sessionId }),
            });
            
            const data = await resp.json();
            
            if (data.error) {
                this.contentEl.innerHTML = `<div class="image-selector-loading" style="grid-column: 1 / -1;">
                    <span style="color: #ff6b6b;">❌ 加载失败: ${data.error}</span>
                </div>`;
                return;
            }
            
            this.images = data.images;
            this._renderImages();
            
        } catch (err) {
            console.error("Image Selector: 加载图片失败", err);
            this.contentEl.innerHTML = `<div class="image-selector-loading" style="grid-column: 1 / -1;">
                <span style="color: #ff6b6b;">❌ 加载失败，请检查连接</span>
            </div>`;
        }
    }

    _renderImages() {
        // 插入工具栏到 contentEl 之前
        const dialog = this.contentEl.parentElement;
        dialog.insertBefore(this._createToolbar(), this.contentEl);
        
        // 清空内容并渲染图片卡片
        this.contentEl.innerHTML = "";
        
        this.images.forEach((img) => {
            const card = document.createElement("div");
            card.className = "image-selector-card";
            card.dataset.index = img.index;
            
            card.innerHTML = `
                <div class="image-selector-checkbox">
                    <span class="image-selector-checkbox-icon">✓</span>
                </div>
                <button class="image-selector-zoom-btn" title="查看大图">🔍</button>
                <div class="image-selector-card-img-wrapper">
                    <img src="${img.data}" alt="Image ${img.index + 1}" />
                </div>
                <div class="image-selector-card-info">
                    <span class="image-selector-index">#${img.index + 1}</span>
                    <span class="image-selector-size">${img.width} × ${img.height}</span>
                </div>
            `;
            
            // 放大按钮点击 -> 预览大图
            const zoomBtn = card.querySelector(".image-selector-zoom-btn");
            zoomBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this._previewImage(img);
            });
            
            // 单击卡片 -> 切换选择
            card.addEventListener("click", (e) => {
                e.stopPropagation();
                this._toggleSelect(img.index, card);
            });
            
            // 双击卡片 -> 预览大图
            card.addEventListener("dblclick", (e) => {
                e.stopPropagation();
                this._previewImage(img);
            });
            
            this.contentEl.appendChild(card);
        });
    }

    _toggleSelect(index, card) {
        if (this.selectedIndices.has(index)) {
            this.selectedIndices.delete(index);
            card.classList.remove("selected");
        } else {
            this.selectedIndices.add(index);
            card.classList.add("selected");
        }
        this._updateCount();
    }

    _selectAll() {
        this.images.forEach(img => this.selectedIndices.add(img.index));
        this.contentEl.querySelectorAll(".image-selector-card").forEach(c => {
            c.classList.add("selected");
        });
        this._updateCount();
    }

    _deselectAll() {
        this.selectedIndices.clear();
        this.contentEl.querySelectorAll(".image-selector-card").forEach(c => {
            c.classList.remove("selected");
        });
        this._updateCount();
    }

    _invertSelection() {
        this.images.forEach(img => {
            if (this.selectedIndices.has(img.index)) {
                this.selectedIndices.delete(img.index);
            } else {
                this.selectedIndices.add(img.index);
            }
        });
        this.contentEl.querySelectorAll(".image-selector-card").forEach(c => {
            const idx = parseInt(c.dataset.index);
            if (this.selectedIndices.has(idx)) {
                c.classList.add("selected");
            } else {
                c.classList.remove("selected");
            }
        });
        this._updateCount();
    }

    _updateCount() {
        const countEl = this.overlay.querySelector("#is-selected-count");
        if (countEl) {
            countEl.textContent = this.selectedIndices.size;
        }
        
        const confirmBtn = this.overlay.querySelector("#is-confirm-btn");
        if (confirmBtn) {
            confirmBtn.disabled = this.selectedIndices.size === 0;
        }
    }

    _onCardSizeChange(size) {
        this.cardSize = size;
        if (this.contentEl) {
            this.contentEl.style.setProperty("--card-min-width", `${size}px`);
        }
    }

    _previewImage(img) {
        const previewOverlay = document.createElement("div");
        previewOverlay.className = "image-selector-preview-overlay";
        previewOverlay.innerHTML = `
            <button class="image-selector-preview-close" title="关闭预览">✕</button>
            <img src="${img.data}" />
            <div class="image-selector-preview-info">#${img.index + 1} · ${img.width} × ${img.height}</div>
        `;
        
        // 点击关闭按钮关闭
        previewOverlay.querySelector(".image-selector-preview-close").addEventListener("click", (e) => {
            e.stopPropagation();
            previewOverlay.remove();
        });
        
        // 点击背景也关闭（但不是点击图片）
        previewOverlay.addEventListener("click", (e) => {
            if (e.target === previewOverlay) {
                previewOverlay.remove();
            }
        });
        
        // ESC 关闭
        const escHandler = (e) => {
            if (e.key === "Escape") {
                previewOverlay.remove();
                document.removeEventListener("keydown", escHandler);
            }
        };
        document.addEventListener("keydown", escHandler);
        
        document.body.appendChild(previewOverlay);
    }

    async _confirm() {
        const selected = Array.from(this.selectedIndices).sort((a, b) => a - b);
        
        if (selected.length === 0) {
            // 没选择任何图片 -> 等同于取消
            await this._cancel();
            return;
        }
        
        try {
            await api.fetchApi("/image_selector/submit_selection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    selected_indices: selected,
                    cancelled: false,
                }),
            });
        } catch (err) {
            console.error("Image Selector: 提交选择失败", err);
        }
        
        this._close();
    }

    async _cancel() {
        // 取消 = 中断工作流
        try {
            await api.fetchApi("/image_selector/submit_selection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    selected_indices: [],
                    cancelled: true,
                }),
            });
        } catch (err) {
            console.error("Image Selector: 提交取消失败", err);
        }
        
        this._close();
    }

    _close() {
        this._stopCountdown();
        if (this.overlay) {
            this.overlay.style.animation = "isOverlayFadeIn 0.2s ease-out reverse";
            setTimeout(() => {
                this.overlay.remove();
                this.overlay = null;
            }, 180);
        }
    }
}

// ============================
// 注册 ComfyUI 扩展
// ============================
app.registerExtension({
    name: "comfyui.image_selector",
    
    async setup() {
        // 监听后端发来的弹窗消息
        api.addEventListener("image_selector.show_dialog", (event) => {
            const {
                session_id,
                total_images,
                node_id,
                sound_enabled,
                sound_volume,
                sound_file,
                timeout,
            } = event.detail;
            
            // 检查该节点是否属于当前工作流，防止多客户端/多标签页重复弹窗
            const node = app.graph.getNodeById(node_id);
            if (!node || node.comfyClass !== "ImageSelector") return;
            
            console.log(`[Image Selector] 收到弹窗请求: session=${session_id}, images=${total_images}, timeout=${timeout}s`);
            
            const dialog = new ImageSelectorDialog(
                session_id,
                total_images,
                node_id,
                sound_enabled,
                sound_volume,
                sound_file,
                timeout
            );
            
            dialog.show();
        });
        
        // 监听中断原因消息，显示 toast 提示
        api.addEventListener("image_selector.interrupted", (event) => {
            const { reason, node_id } = event.detail;
            
            // 检查该节点是否属于当前工作流
            const node = app.graph.getNodeById(node_id);
            if (!node || node.comfyClass !== "ImageSelector") return;
            
            console.log(`[Image Selector] 工作流中断: ${reason}`);
            showToast(reason);
        });
    },

    async nodeCreated(node) {
        if (node.comfyClass === "ImageSelector") {
            node.color = "#1a1a2e";
            node.bgcolor = "#16213e";
        }
    },
});
