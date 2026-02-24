import { defineToolbarApp } from 'astro/toolbar';

export default defineToolbarApp({
  init(canvas, app, server) {
    const style = document.createElement('style');
    style.textContent = `
      .org-debug-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 16px;
        max-width: 800px;
      }
      .org-debug-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .org-debug-title {
        font-size: 16px;
        font-weight: 600;
        color: #fff;
      }
      .org-debug-status {
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 4px;
        background: #333;
      }
      .org-debug-status.org-file {
        background: #2d5a27;
        color: #90EE90;
      }
      .org-debug-status.not-org {
        background: #444;
        color: #999;
      }
      .org-debug-tabs {
        display: flex;
        gap: 4px;
        margin-bottom: 12px;
      }
      .org-debug-tab {
        padding: 6px 12px;
        font-size: 12px;
        border: none;
        background: #333;
        color: #999;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .org-debug-tab:hover {
        background: #444;
        color: #ccc;
      }
      .org-debug-tab.active {
        background: #6366f1;
        color: #fff;
      }
      .org-debug-content {
        background: #1e1e1e;
        border-radius: 8px;
        padding: 16px;
        overflow: auto;
        max-height: 400px;
        font-family: 'Fira Code', 'Consolas', monospace;
        font-size: 12px;
        line-height: 1.5;
        color: #d4d4d4;
        white-space: pre-wrap;
        word-break: break-word;
        border: 1px solid #333;
      }
      .org-debug-empty {
        text-align: center;
        padding: 40px;
        color: #666;
      }
      .org-debug-empty-icon {
        font-size: 48px;
        margin-bottom: 12px;
      }
      .org-debug-info {
        margin-top: 12px;
        font-size: 12px;
        color: #888;
      }
      .org-debug-info-row {
        display: flex;
        gap: 8px;
        margin-bottom: 4px;
      }
      .org-debug-info-label {
        color: #666;
        min-width: 80px;
      }
      .org-debug-info-value {
        color: #aaa;
      }
      .org-debug-section {
        display: none;
      }
      .org-debug-section.visible {
        display: block;
      }
      .org-debug-section-title {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #888;
        margin-bottom: 8px;
        padding-bottom: 4px;
        border-bottom: 1px solid #333;
      }
    `;
    canvas.appendChild(style);

    const container = document.createElement('div');
    container.className = 'org-debug-container';

    const header = document.createElement('div');
    header.className = 'org-debug-header';

    const title = document.createElement('div');
    title.className = 'org-debug-title';
    title.textContent = 'Org-Mode Debug';

    const status = document.createElement('span');
    status.className = 'org-debug-status';
    status.textContent = 'Checking...';

    header.appendChild(title);
    header.appendChild(status);
    container.appendChild(header);

    const tabs = document.createElement('div');
    tabs.className = 'org-debug-tabs';

    const markdownTab = document.createElement('button');
    markdownTab.className = 'org-debug-tab active';
    markdownTab.textContent = 'Markdown';

    const frontmatterTab = document.createElement('button');
    frontmatterTab.className = 'org-debug-tab';
    frontmatterTab.textContent = 'Frontmatter';

    tabs.appendChild(markdownTab);
    tabs.appendChild(frontmatterTab);
    container.appendChild(tabs);

    const content = document.createElement('div');
    content.className = 'org-debug-content';
    content.textContent = 'Waiting for page data...';
    container.appendChild(content);

    const info = document.createElement('div');
    info.className = 'org-debug-info';
    container.appendChild(info);

    canvas.appendChild(container);

    let currentTab: 'markdown' | 'frontmatter' = 'markdown';
    let currentData: { markdown: string; frontmatter: string } | null = null;

    function updateContent() {
      if (!currentData) {
        content.textContent = 'Waiting for page data...';
        return;
      }

      if (currentTab === 'markdown') {
        content.textContent = currentData.markdown || '(empty)';
      } else {
        content.textContent = currentData.frontmatter || '(no frontmatter)';
      }
    }

    markdownTab.addEventListener('click', () => {
      currentTab = 'markdown';
      markdownTab.classList.add('active');
      frontmatterTab.classList.remove('active');
      updateContent();
    });

    frontmatterTab.addEventListener('click', () => {
      currentTab = 'frontmatter';
      frontmatterTab.classList.add('active');
      markdownTab.classList.remove('active');
      updateContent();
    });

    let currentPagePath = window.location.pathname;

    function updateDebugPanel() {
      server.send('org-mode:get-markdown', { path: currentPagePath });
    }

    server.on(
      'org-mode:markdown-data',
      (data: {
        path: string;
        markdown: string;
        frontmatter: string;
        isOrgFile: boolean;
        sourceFile?: string;
      }) => {
        if (data.path !== currentPagePath) return;

        if (data.isOrgFile) {
          status.className = 'org-debug-status org-file';
          status.textContent = '.org file';

          currentData = {
            markdown: data.markdown,
            frontmatter: data.frontmatter,
          };
          updateContent();

          info.innerHTML = `
          <div class="org-debug-info-row">
            <span class="org-debug-info-label">Source:</span>
            <span class="org-debug-info-value">${data.sourceFile || 'unknown'}</span>
          </div>
          <div class="org-debug-info-row">
            <span class="org-debug-info-label">Path:</span>
            <span class="org-debug-info-value">${data.path}</span>
          </div>
        `;
        } else {
          status.className = 'org-debug-status not-org';
          status.textContent = 'Not .org';

          currentData = null;
          content.innerHTML = `
          <div class="org-debug-empty">
            <div class="org-debug-empty-icon">📄</div>
            <div>Current page is not an org-mode file</div>
          </div>
        `;
          info.innerHTML = `
          <div class="org-debug-info-row">
            <span class="org-debug-info-label">Source:</span>
            <span class="org-debug-info-value">${data.sourceFile || 'not an org file'}</span>
          </div>
        `;
        }
      }
    );

    let isEnabled = true;

    app.onToggled(({ state }) => {
      isEnabled = state;
      if (state) {
        currentPagePath = window.location.pathname;
        updateDebugPanel();
      }
    });

    const originalPushState = history.pushState;
    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      currentPagePath = window.location.pathname;
      if (isEnabled) {
        updateDebugPanel();
      }
    };

    window.addEventListener('popstate', () => {
      currentPagePath = window.location.pathname;
      if (isEnabled) {
        updateDebugPanel();
      }
    });

    updateDebugPanel();
  },
});
