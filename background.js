// Background Service Worker
// アイコンの状態を管理

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_ICON') {
    updateIcon(message.isMergeable, sender.tab.id);
  }
});

function updateIcon(isMergeable, tabId) {
  const iconPath = isMergeable
    ? {
        16: 'icon-green-16.png',
        48: 'icon-green-48.png',
        128: 'icon-green-128.png'
      }
    : {
        16: 'icon16.png',
        48: 'icon48.png',
        128: 'icon128.png'
      };

  chrome.action.setIcon({
    path: iconPath,
    tabId: tabId
  });
}

// タブが閉じられたらアイコンをリセット
chrome.tabs.onRemoved.addListener((tabId) => {
  // デフォルトアイコンに戻す
  chrome.action.setIcon({
    path: {
      16: 'icon16.png',
      48: 'icon48.png',
      128: 'icon128.png'
    }
  });
});
