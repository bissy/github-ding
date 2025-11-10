// GitHubのプルリクエストページでマージ可能状態を監視
(function() {
  'use strict';

  let lastStatus = null;
  let hasPlayedSound = false;

  // マージ可能状態をチェック
  function checkMergeStatus() {
    // "All checks have passed" のテキストを探す
    const allChecksPassedElement = Array.from(document.querySelectorAll('h3')).find(h3 =>
      h3.textContent.includes('All checks have passed')
    );

    // 緑色のマージボタンを探す（"Merge pull request" テキスト）
    const mergeButton = Array.from(document.querySelectorAll('button')).find(btn =>
      btn.textContent.includes('Merge pull request')
    );

    // borderColor-success-emphasis クラスを持つ要素を探す（緑色のボーダー）
    const successBorder = document.querySelector('.borderColor-success-emphasis');

    // マージ可能を示す緑色の円形プログレスを探す
    const successCircle = document.querySelector('circle[style*="stroke: var(--fgColor-success)"]');
    const fullCircle = successCircle && successCircle.getAttribute('style')?.includes('276.46, 276.46');

    const isMergeable = !!(allChecksPassedElement && mergeButton && successBorder && fullCircle);

    console.log('GitHub PR Ding - Status check:', {
      allChecksPassed: !!allChecksPassedElement,
      mergeButton: !!mergeButton,
      successBorder: !!successBorder,
      fullCircle: !!fullCircle,
      isMergeable,
      lastStatus,
      hasPlayedSound
    });

    // アイコンを更新（常に）
    chrome.runtime.sendMessage({
      type: 'UPDATE_ICON',
      isMergeable: isMergeable
    }).catch(() => {
      // エラーは無視（拡張機能が再読み込み中の場合など）
    });

    // ステータスが変わり、マージ可能になった場合
    if (isMergeable && lastStatus === false && !hasPlayedSound) {
      console.log('🔔 GitHub PR Ding - PR is now mergeable! Playing notification sound!');
      playDingSound();
      hasPlayedSound = true;

      // 通知も表示
      showNotification();
    }

    lastStatus = isMergeable;
  }

  // Ding音を再生
  function playDingSound() {
    // 保存された設定を読み込む
    chrome.storage.sync.get({
      notificationSound: 'ding',
      volume: 0.7
    }, function(items) {
      try {
        const audio = new Audio(chrome.runtime.getURL(`${items.notificationSound}.mp3`));
        audio.volume = items.volume;
        audio.play().catch(err => {
          console.error('Failed to play sound:', err);
        });
      } catch (err) {
        console.error('Failed to create audio:', err);
      }
    });
  }

  // 通知を表示
  function showNotification() {
    // ページタイトルを一時的に変更
    const originalTitle = document.title;
    document.title = '🟢 PR がマージ可能です！';

    setTimeout(() => {
      document.title = originalTitle;
    }, 5000);

    // 画面上に通知を表示
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2da44e;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = '🟢 プルリクエストがマージ可能になりました！';

    // アニメーション用のスタイルを追加
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // 5秒後に通知を削除
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
  }

  // MutationObserverでDOMの変更を監視
  const observer = new MutationObserver(() => {
    checkMergeStatus();
  });

  // 監視開始
  function startObserving() {
    const targetNode = document.querySelector('body');
    if (targetNode) {
      observer.observe(targetNode, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
      });

      // 初回チェック
      checkMergeStatus();

      console.log('GitHub PR Ding - Monitoring started');
    } else {
      // bodyが見つからない場合は少し待ってから再試行
      setTimeout(startObserving, 100);
    }
  }

  // ページ読み込み後に監視開始
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserving);
  } else {
    startObserving();
  }

  // 定期的にもチェック（念のため）
  setInterval(checkMergeStatus, 5000);
})();
