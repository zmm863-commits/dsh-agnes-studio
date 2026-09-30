/**
 * 新增面板样式 — 背景视频 / MTV / 小说工具 / 多能宝箱 / 视频解析 / 微信公众号
 *
 * 层叠顺序：第 13/13 层（最后加载，确保优先级）
 * 设计原则：与原有面板风格一致，使用相同的 CSS 变量和设计语言
 */

export const NEW_PANELS_CSS = `/* ─── 新增面板通用样式 ─────────────────────────────────────────────── */

/* 面板容器 */
.bgvideo-panel,
.mv-panel,
.novel-split-panel,
.toolbox-panel,
.videoparse-panel,
.wechat-panel {
  padding: 16px;
  overflow-y: auto;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 面板头部 */
.bgvideo-header,
.mv-header,
.novel-split-header,
.toolbox-header,
.videoparse-header,
.wechat-header {
  padding: 16px;
  border-radius: 12px;
  background: var(--ag-surface-2, rgba(255,255,255,0.55));
  border: 1px solid var(--ag-line, rgba(0,0,0,0.08));
}

.bgvideo-header h3,
.mv-header h3,
.novel-split-header h3,
.toolbox-header h3,
.videoparse-header h3,
.wechat-header h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--ag-t1, #1a1a2e);
  display: flex;
  align-items: center;
  gap: 8px;
}

.bgvideo-desc,
.mv-desc,
.novel-split-desc,
.toolbox-desc,
.videoparse-desc,
.wechat-desc {
  margin: 0;
  font-size: 12px;
  color: var(--ag-muted, #6b7280);
}

/* 错误提示 */
.bgvideo-error,
.mv-error,
.novel-split-error,
.toolbox-error,
.videoparse-error,
.wechat-error,
.split-error,
.deai-error,
.parse-error,
.vpt-error,
.localfiles-error {
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #dc2626;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 状态区域 */
.bgvideo-status,
.mv-status,
.split-status,
.deai-status,
.vpt-status {
  padding: 12px 16px;
  border-radius: 10px;
  background: var(--ag-surface-2, rgba(255,255,255,0.55));
  border: 1px solid var(--ag-line, rgba(0,0,0,0.08));
}

.bgvideo-status-header,
.mv-status-header,
.split-status-header,
.deai-status-header,
.vpt-status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.bgvideo-status-header span:first-child,
.mv-status-header span:first-child,
.split-status-header span:first-child,
.deai-status-header span:first-child,
.vpt-status-header span:first-child {
  font-size: 13px;
  font-weight: 600;
  color: var(--ag-t1, #1a1a2e);
}

/* 徽章 */
.bgvideo-badge,
.mv-badge,
.split-badge,
.deai-badge,
.vpt-badge,
.wechat-badge,
.parse-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.bgvideo-badge-segmenting,
.mv-badge-music,
.split-badge-running,
.deai-badge-running,
.vpt-badge-running,
.parse-badge-running {
  background: rgba(59, 130, 246, 0.15);
  color: #2563eb;
}

.bgvideo-badge-segmented,
.bgvideo-badge-completed,
.mv-badge-completed,
.split-badge-completed,
.deai-badge-completed,
.vpt-badge-completed,
.parse-badge-completed,
.wechat-badge-published {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
}

.bgvideo-badge-generating,
.mv-badge-design,
.mv-badge-storyboard,
.mv-badge-video {
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
}

.bgvideo-badge-failed,
.mv-badge-failed,
.split-badge-failed,
.deai-badge-failed,
.vpt-badge-failed,
.parse-badge-failed {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
}

.bgvideo-badge-stopped,
.mv-badge-stopped,
.split-badge-stopped,
.deai-badge-stopped,
.vpt-badge-stopped,
.wechat-badge-draft {
  background: rgba(107, 114, 128, 0.15);
  color: #6b7280;
}

/* 区域容器 */
.bgvideo-section,
.mv-section,
.split-section,
.deai-section,
.parse-section,
.vpt-section,
.wechat-section,
.localfiles-section {
  padding: 16px;
  border-radius: 12px;
  background: var(--ag-surface-2, rgba(255,255,255,0.55));
  border: 1px solid var(--ag-line, rgba(0,0,0,0.08));
}

.bgvideo-section h4,
.mv-section h4,
.split-section h4,
.deai-section h4,
.parse-section h4,
.vpt-section h4,
.wechat-section h4,
.localfiles-section h4 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--ag-t1, #1a1a2e);
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 表单容器 */
.bgvideo-form,
.mv-form,
.split-form,
.deai-form,
.parse-form,
.vpt-form,
.wechat-form,
.localfiles-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 表单标签 */
.bgvideo-label,
.mv-label,
.split-label,
.deai-label,
.parse-label,
.vpt-label,
.wechat-label,
.localfiles-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ag-t2, #4b5563);
}

/* 输入框 */
.bgvideo-label input,
.bgvideo-label select,
.bgvideo-label textarea,
.mv-label input,
.mv-label select,
.mv-label textarea,
.split-label input,
.split-label select,
.split-label textarea,
.deai-label input,
.deai-label select,
.deai-label textarea,
.parse-label input,
.parse-label select,
.vpt-label input,
.vpt-label select,
.wechat-label input,
.wechat-label textarea,
.localfiles-label input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--ag-line-strong, rgba(0,0,0,0.15));
  background: var(--ag-surface, #ffffff);
  color: var(--ag-t1, #1a1a2e);
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.15s ease;
}

.bgvideo-label input:focus,
.bgvideo-label select:focus,
.bgvideo-label textarea:focus,
.mv-label input:focus,
.mv-label select:focus,
.mv-label textarea:focus,
.split-label input:focus,
.split-label select:focus,
.split-label textarea:focus,
.deai-label input:focus,
.deai-label select:focus,
.deai-label textarea:focus,
.parse-label input:focus,
.parse-label select:focus,
.vpt-label input:focus,
.vpt-label select:focus,
.wechat-label input:focus,
.wechat-label textarea:focus {
  outline: none;
  border-color: var(--ag-accent, #6366f1);
}

/* 按钮 */
.bgvideo-btn,
.mv-btn,
.split-btn,
.deai-btn,
.parse-btn,
.vpt-btn,
.wechat-btn,
.localfiles-btn {
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.bgvideo-btn:disabled,
.mv-btn:disabled,
.split-btn:disabled,
.deai-btn:disabled,
.parse-btn:disabled,
.vpt-btn:disabled,
.wechat-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bgvideo-btn-primary,
.mv-btn-primary,
.split-btn-primary,
.deai-btn-primary,
.parse-btn-primary,
.vpt-btn-primary,
.wechat-btn-primary {
  background: var(--ag-accent, #6366f1);
  color: #ffffff;
}

.bgvideo-btn-primary:hover:not(:disabled),
.mv-btn-primary:hover:not(:disabled),
.split-btn-primary:hover:not(:disabled),
.deai-btn-primary:hover:not(:disabled),
.parse-btn-primary:hover:not(:disabled),
.vpt-btn-primary:hover:not(:disabled),
.wechat-btn-primary:hover:not(:disabled) {
  background: var(--ag-accent-hover, #818cf8);
}

/* 多能宝箱按钮（vidbee 下载 / tts 语音）——此前类名未定义，会退回浏览器默认的灰底白字 */
.vidbee-btn,
.tts-btn {
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.vidbee-btn:disabled,
.tts-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vidbee-btn-primary,
.tts-btn-primary {
  background: var(--ag-accent, #0891b2);
  color: #ffffff;
}

.vidbee-btn-primary:hover:not(:disabled),
.tts-btn-primary:hover:not(:disabled) {
  background: var(--ag-accent-hover, #0e7490);
}

.bgvideo-btn-secondary,
.mv-btn-secondary,
.split-btn-secondary,
.deai-btn-secondary,
.wechat-btn-secondary {
  background: var(--ag-surface-3, rgba(0,0,0,0.05));
  color: var(--ag-t1, #1a1a2e);
  border: 1px solid var(--ag-line-strong, rgba(0,0,0,0.15));
}

.bgvideo-btn-secondary:hover:not(:disabled),
.mv-btn-secondary:hover:not(:disabled),
.split-btn-secondary:hover:not(:disabled),
.deai-btn-secondary:hover:not(:disabled),
.wechat-btn-secondary:hover:not(:disabled) {
  background: var(--ag-surface-4, rgba(0,0,0,0.08));
}

.bgvideo-btn-danger,
.mv-btn-danger,
.split-btn-danger,
.localfiles-btn-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.bgvideo-btn-danger:hover:not(:disabled),
.mv-btn-danger:hover:not(:disabled),
.split-btn-danger:hover:not(:disabled),
.localfiles-btn-danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.15);
}

.bgvideo-btn-small,
.mv-btn-small,
.wechat-btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

/* 文件列表 */
.bgvideo-file,
.mv-file {
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--ag-surface-3, rgba(0,0,0,0.05));
  font-size: 11px;
  color: var(--ag-t2, #4b5563);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* 任务列表 */
.bgvideo-task-list,
.mv-task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bgvideo-task-item,
.mv-task-item {
  padding: 12px;
  border-radius: 8px;
  background: var(--ag-surface-3, rgba(0,0,0,0.03));
  border: 1px solid var(--ag-line, rgba(0,0,0,0.06));
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.bgvideo-task-item:hover,
.mv-task-item:hover {
  background: var(--ag-surface-4, rgba(0,0,0,0.06));
  border-color: var(--ag-line-strong, rgba(0,0,0,0.12));
}

.bgvideo-task-time,
.mv-task-time {
  font-size: 11px;
  color: var(--ag-muted, #6b7280);
}

/* 空状态 */
.bgvideo-empty,
.mv-empty,
.wechat-empty,
.localfiles-empty {
  padding: 24px;
  text-align: center;
  color: var(--ag-muted, #6b7280);
  font-size: 13px;
}

/* 页签切换 */
.novel-split-tabs,
.toolbox-tabs,
.videoparse-tabs,
.wechat-tabs {
  display: flex;
  gap: 8px;
  padding: 4px;
  border-radius: 10px;
  background: var(--ag-surface-3, rgba(0,0,0,0.05));
}

.novel-split-tab,
.toolbox-tab,
.videoparse-tab,
.wechat-tab {
  flex: 1;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: var(--ag-t2, #4b5563);
  cursor: pointer;
  transition: all 0.15s ease;
}

.novel-split-tab:hover,
.toolbox-tab:hover,
.videoparse-tab:hover,
.wechat-tab:hover {
  background: var(--ag-surface-4, rgba(0,0,0,0.05));
}

.novel-split-tab.active,
.toolbox-tab.active,
.videoparse-tab.active,
.wechat-tab.active {
  background: var(--ag-surface, #ffffff);
  color: var(--ag-t1, #1a1a2e);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* 角色列表 */
.bgvideo-char-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.bgvideo-char-item {
  padding: 12px;
  border-radius: 8px;
  background: var(--ag-surface-3, rgba(0,0,0,0.03));
  border: 1px solid var(--ag-line, rgba(0,0,0,0.06));
}

.bgvideo-char-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.bgvideo-char-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ag-t1, #1a1a2e);
}

.bgvideo-char-gender {
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--ag-surface-4, rgba(0,0,0,0.08));
  font-size: 11px;
  color: var(--ag-t2, #4b5563);
}

.bgvideo-char-appearance {
  font-size: 12px;
  color: var(--ag-muted, #6b7280);
  flex: 1;
}

.bgvideo-char-actions {
  display: flex;
  gap: 6px;
}

.bgvideo-char-anchor {
  margin-top: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(34, 197, 94, 0.1);
  font-size: 11px;
  color: #16a34a;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* 分镜列表 */
.bgvideo-shot-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
}

.bgvideo-shot-item {
  padding: 8px 12px;
  border-radius: 6px;
  background: var(--ag-surface-3, rgba(0,0,0,0.03));
  display: flex;
  align-items: center;
  gap: 8px;
}

.bgvideo-shot-index {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--ag-accent, #6366f1);
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bgvideo-shot-desc {
  flex: 1;
  font-size: 12px;
  color: var(--ag-t1, #1a1a2e);
}

.bgvideo-shot-chars {
  font-size: 11px;
  color: var(--ag-muted, #6b7280);
}

.bgvideo-more {
  text-align: center;
  font-size: 11px;
  color: var(--ag-muted, #6b7280);
  padding: 8px;
}

/* 进度条 */
.bgvideo-progress {
  margin-top: 12px;
}

.bgvideo-progress-bar {
  height: 4px;
  border-radius: 2px;
  background: var(--ag-surface-4, rgba(0,0,0,0.1));
  overflow: hidden;
}

.bgvideo-progress-bar::after {
  content: '';
  display: block;
  height: 100%;
  width: 60%;
  border-radius: 2px;
  background: var(--ag-accent, #6366f1);
  animation: progress 2s ease-in-out infinite;
}

@keyframes progress {
  0% { width: 0%; }
  50% { width: 60%; }
  100% { width: 100%; }
}

/* 弹窗 */
.bgvideo-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.bgvideo-modal-content {
  background: var(--ag-surface, #ffffff);
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.bgvideo-modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--ag-line, rgba(0,0,0,0.08));
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bgvideo-modal-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--ag-t1, #1a1a2e);
}

.bgvideo-modal-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: var(--ag-surface-3, rgba(0,0,0,0.05));
  color: var(--ag-t2, #4b5563);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.bgvideo-modal-close:hover {
  background: var(--ag-surface-4, rgba(0,0,0,0.1));
}

/* 联系表网格 */
.bgvideo-contact-grid {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  overflow-y: auto;
}

.bgvideo-contact-item {
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  background: var(--ag-surface-3, rgba(0,0,0,0.05));
  position: relative;
}

.bgvideo-contact-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bgvideo-contact-item span {
  position: absolute;
  bottom: 4px;
  right: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(0,0,0,0.6);
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;
}

/* 视频预览 */
.bgvideo-preview {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000000;
}

.bgvideo-video {
  max-width: 100%;
  max-height: 60vh;
  border-radius: 8px;
}

/* 音频播放 */
.tts-audio {
  width: 100%;
  margin-top: 12px;
}

/* 日志区域 */
.vidbee-log {
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #1a1a2e;
  color: #e5e7eb;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 文件列表 */
.localfiles-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.localfiles-item {
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--ag-surface-3, rgba(0,0,0,0.03));
  border: 1px solid var(--ag-line, rgba(0,0,0,0.06));
  display: flex;
  align-items: center;
  gap: 12px;
}

.localfiles-name {
  flex: 1;
  font-size: 13px;
  color: var(--ag-t1, #1a1a2e);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.localfiles-size {
  font-size: 11px;
  color: var(--ag-muted, #6b7280);
  flex-shrink: 0;
}

.localfiles-mtime {
  font-size: 11px;
  color: var(--ag-muted, #6b7280);
  flex-shrink: 0;
}

/* 文章列表 */
.wechat-article-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wechat-article-item {
  padding: 12px;
  border-radius: 8px;
  background: var(--ag-surface-3, rgba(0,0,0,0.03));
  border: 1px solid var(--ag-line, rgba(0,0,0,0.06));
}

.wechat-article-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.wechat-article-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ag-t1, #1a1a2e);
  flex: 1;
}

.wechat-article-author {
  font-size: 11px;
  color: var(--ag-muted, #6b7280);
}

.wechat-article-actions {
  display: flex;
  gap: 6px;
}

/* 场景列表 */
.parse-scenes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.parse-scene {
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--ag-surface-3, rgba(0,0,0,0.03));
  border: 1px solid var(--ag-line, rgba(0,0,0,0.06));
}

.parse-scene-time {
  font-size: 11px;
  color: var(--ag-muted, #6b7280);
  margin-right: 8px;
}

/* 关键帧网格 */
.parse-keyframe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.parse-keyframe {
  aspect-ratio: 16/9;
  border-radius: 6px;
  overflow: hidden;
  background: var(--ag-surface-3, rgba(0,0,0,0.05));
  position: relative;
}

.parse-keyframe img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.parse-keyframe span {
  position: absolute;
  bottom: 2px;
  right: 2px;
  padding: 1px 4px;
  border-radius: 3px;
  background: rgba(0,0,0,0.6);
  color: #ffffff;
  font-size: 9px;
  font-weight: 600;
}

/* 滚动条美化 */
.bgvideo-panel::-webkit-scrollbar,
.mv-panel::-webkit-scrollbar,
.novel-split-panel::-webkit-scrollbar,
.toolbox-panel::-webkit-scrollbar,
.videoparse-panel::-webkit-scrollbar,
.wechat-panel::-webkit-scrollbar {
  width: 6px;
}

.bgvideo-panel::-webkit-scrollbar-track,
.mv-panel::-webkit-scrollbar-track,
.novel-split-panel::-webkit-scrollbar-track,
.toolbox-panel::-webkit-scrollbar-track,
.videoparse-panel::-webkit-scrollbar-track,
.wechat-panel::-webkit-scrollbar-track {
  background: transparent;
}

.bgvideo-panel::-webkit-scrollbar-thumb,
.mv-panel::-webkit-scrollbar-thumb,
.novel-split-panel::-webkit-scrollbar-thumb,
.toolbox-panel::-webkit-scrollbar-thumb,
.videoparse-panel::-webkit-scrollbar-thumb,
.wechat-panel::-webkit-scrollbar-thumb {
  background: rgba(108,92,231,0.3);
  border-radius: 3px;
}

.bgvideo-panel::-webkit-scrollbar-thumb:hover,
.mv-panel::-webkit-scrollbar-thumb:hover,
.novel-split-panel::-webkit-scrollbar-thumb:hover,
.toolbox-panel::-webkit-scrollbar-thumb:hover,
.videoparse-panel::-webkit-scrollbar-thumb:hover,
.wechat-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(108,92,231,0.5);
}

/* ═══ 补全 1：子面板根容器（tab 内的子面板，此前无样式） ═══════════════ */
.deai-panel,
.parse-panel,
.split-panel,
.tts-panel,
.vidbee-panel,
.vpt-panel,
.localfiles-panel,
.wechat-article-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ═══ 补全 2：操作按钮区 ═══════════════════════════════════════════════ */
.bgvideo-actions,
.mv-actions,
.deai-actions,
.split-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

/* ═══ 补全 3：结果展示区 ═══════════════════════════════════════════════ */
.deai-result,
.parse-result,
.split-result,
.tts-result,
.vpt-result {
  padding: 12px;
  border-radius: 8px;
  background: var(--ag-surface-3, rgba(0,0,0,0.03));
  border: 1px solid var(--ag-line, rgba(0,0,0,0.06));
  font-size: 13px;
  color: var(--ag-t1, #1a1a2e);
  white-space: pre-wrap;
  word-break: break-word;
}

.deai-result textarea,
.parse-result textarea,
.split-result textarea,
.tts-result textarea,
.vpt-result textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--ag-line-strong, rgba(0,0,0,0.15));
  background: var(--ag-surface, #ffffff);
  color: var(--ag-t1, #1a1a2e);
  font-family: inherit;
  font-size: 13px;
  resize: vertical;
}

/* ═══ 补全 4：多能宝箱表单 / 标签 / 错误 ═══════════════════════════════ */
.tts-form,
.vidbee-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tts-label,
.vidbee-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ag-t2, #4b5563);
}

.tts-label input,
.tts-label textarea,
.tts-label select,
.vidbee-label input,
.vidbee-label textarea,
.vidbee-label select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--ag-line-strong, rgba(0,0,0,0.15));
  background: var(--ag-surface, #ffffff);
  color: var(--ag-t1, #1a1a2e);
  font-size: 13px;
  font-family: inherit;
}

.tts-error,
.vidbee-error {
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #dc2626;
  font-size: 13px;
}

/* ═══ 补全 5：视频解析状态区（与其余 status 同构） ═════════════════════ */
.parse-status {
  padding: 12px 16px;
  border-radius: 10px;
  background: var(--ag-surface-2, rgba(255,255,255,0.55));
  border: 1px solid var(--ag-line, rgba(0,0,0,0.08));
}

.parse-status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ag-t1, #1a1a2e);
}

.parse-keyframes {
  margin-top: 12px;
}

/* ═══ 补全 6：背景视频分幕列表 ═════════════════════════════════════════ */
.bgvideo-segments {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
  max-height: 320px;
  overflow-y: auto;
}

.bgvideo-segment {
  padding: 8px 12px;
  border-radius: 6px;
  background: var(--ag-surface-3, rgba(0,0,0,0.03));
}

.bgvideo-segment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ag-t1, #1a1a2e);
}

.bgvideo-segment-time {
  font-size: 11px;
  font-weight: 400;
  color: var(--ag-muted, #6b7280);
}

.bgvideo-segment-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--ag-t2, #4b5563);
}

/* ═══ 补全 7：风格截图列表 / MTV 视频元素 ══════════════════════════════ */
.bgvideo-style-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.mv-video {
  width: 100%;
  max-height: 360px;
  border-radius: 8px;
  background: #000000;
}

/* ═══ 补全 8：pending 徽章（枚举里有 pending，此前漏定义） ════════════ */
.bgvideo-badge-pending,
.mv-badge-pending,
.split-badge-pending,
.deai-badge-pending,
.parse-badge-pending,
.vpt-badge-pending {
  background: rgba(107, 114, 128, 0.15);
  color: #6b7280;
}

/* ═══ 原生文件选择控件 <input type="file"> ═════════════════════════════════════
   浏览器默认把「选择文件」按钮渲染成灰底白字，且 background/color 无法接管，
   必须用 ::file-selector-button 伪元素。这是此前「按钮发灰」的真正原因。 */
input[type="file"]::file-selector-button {
  padding: 6px 14px;
  margin: 0 10px 0 0;
  border: none;
  border-radius: 6px;
  background: var(--ag-accent, #0891b2);
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease;
}

input[type="file"]::file-selector-button:hover {
  background: var(--ag-accent-hover, #0e7490);
}

/* 旧版 Chromium/WebKit 内核语法 */
input[type="file"]::-webkit-file-upload-button {
  padding: 6px 14px;
  margin: 0 10px 0 0;
  border: none;
  border-radius: 6px;
  background: var(--ag-accent, #0891b2);
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}

input[type="file"]::-webkit-file-upload-button:hover {
  background: var(--ag-accent-hover, #0e7490);
}

/* 文件选择框本体：与主题一致，避免灰色容器 */
input[type="file"] {
  padding: 6px 10px !important;
  border: 1px solid var(--ag-line-strong, rgba(0,0,0,0.15)) !important;
  border-radius: 8px !important;
  background: var(--ag-surface, #ffffff) !important;
  color: var(--ag-muted, #6b7280) !important;
  font-size: 12px !important;
  max-width: 100%;
  box-sizing: border-box;
}
`
