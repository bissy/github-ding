// Background Service Worker
// アイコンの状態を管理

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_ICON') {
    updateIcon(message.isMergeable, sender.tab.id);
  } else if (message.type === 'PLAY_SOUND') {
    playSound();
  }
});

// 通知音を再生
function playSound() {
  chrome.storage.sync.get({
    notificationSound: 'meow',
    volume: 0.7
  }, function(items) {
    // オフスクリーンドキュメントを使って音声を再生
    createOffscreenDocument(items.notificationSound, items.volume);
  });
}

// オフスクリーンドキュメントを作成して音声を再生
async function createOffscreenDocument(soundName, volume) {
  // 既存のオフスクリーンドキュメントがあるか確認
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });

  if (existingContexts.length > 0) {
    // 既存のドキュメントにメッセージを送る
    chrome.runtime.sendMessage({
      type: 'PLAY_OFFSCREEN_SOUND',
      soundName: soundName,
      volume: volume
    });
    return;
  }

  // オフスクリーンドキュメントを作成
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'Play notification sound when PR becomes mergeable'
  });

  // ドキュメント作成後、メッセージを送る
  chrome.runtime.sendMessage({
    type: 'PLAY_OFFSCREEN_SOUND',
    soundName: soundName,
    volume: volume
  });
}

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
