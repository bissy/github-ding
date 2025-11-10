// オプションページのスクリプト
(function() {
  'use strict';

  const soundRadios = document.querySelectorAll('input[name="sound"]');
  const soundOptions = document.querySelectorAll('.sound-option');
  const volumeSlider = document.getElementById('volume');
  const volumeValue = document.getElementById('volume-value');
  const saveButton = document.querySelector('.save-button');
  const statusMessage = document.getElementById('status');
  const previewButtons = document.querySelectorAll('.preview-button');

  // 保存された設定を読み込む
  function loadSettings() {
    chrome.storage.sync.get({
      notificationSound: 'ding',
      volume: 0.7
    }, function(items) {
      // 音声設定を反映
      soundRadios.forEach(radio => {
        if (radio.value === items.notificationSound) {
          radio.checked = true;
          updateSelectedOption(radio.value);
        }
      });

      // 音量設定を反映
      const volumePercent = Math.round(items.volume * 100);
      volumeSlider.value = volumePercent;
      volumeValue.textContent = `${volumePercent}%`;
    });
  }

  // 選択されたオプションを視覚的に更新
  function updateSelectedOption(selectedValue) {
    soundOptions.forEach(option => {
      if (option.dataset.sound === selectedValue) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });
  }

  // 音声を試聴
  function previewSound(soundName) {
    const audio = new Audio(chrome.runtime.getURL(`${soundName}.mp3`));
    const volume = volumeSlider.value / 100;
    audio.volume = volume;
    audio.play().catch(err => {
      console.error('Failed to play preview:', err);
    });
  }

  // 設定を保存
  function saveSettings() {
    const selectedSound = document.querySelector('input[name="sound"]:checked').value;
    const volume = volumeSlider.value / 100;

    chrome.storage.sync.set({
      notificationSound: selectedSound,
      volume: volume
    }, function() {
      // 保存成功メッセージを表示
      statusMessage.textContent = '設定を保存しました!';
      statusMessage.classList.add('success');

      setTimeout(() => {
        statusMessage.classList.remove('success');
      }, 3000);
    });
  }

  // イベントリスナーを設定
  soundRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      updateSelectedOption(this.value);
    });
  });

  soundOptions.forEach(option => {
    option.addEventListener('click', function(e) {
      if (e.target.classList.contains('preview-button')) {
        return; // 試聴ボタンのクリックは別処理
      }
      const radio = this.querySelector('input[type="radio"]');
      radio.checked = true;
      updateSelectedOption(radio.value);
    });
  });

  previewButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const soundName = this.dataset.preview;
      previewSound(soundName);
    });
  });

  volumeSlider.addEventListener('input', function() {
    volumeValue.textContent = `${this.value}%`;
  });

  saveButton.addEventListener('click', saveSettings);

  // ページ読み込み時に設定を読み込む
  loadSettings();
})();
