// Offscreen document for audio playback
// バックグラウンドで音声を再生するためのドキュメント

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PLAY_OFFSCREEN_SOUND') {
    playSound(message.soundName, message.volume);
  }
});

function playSound(soundName, volume) {
  try {
    const audio = new Audio(chrome.runtime.getURL(`${soundName}.mp3`));
    audio.volume = volume;
    audio.play().catch(err => {
      console.error('Failed to play sound in offscreen document:', err);
    });
  } catch (err) {
    console.error('Failed to create audio in offscreen document:', err);
  }
}
