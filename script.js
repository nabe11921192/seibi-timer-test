// ✅ 要素の取得
const timerPar = document.getElementById("timer");
const minutesLbl = document.getElementById("minutes");
const secondsLbl = document.getElementById("seconds");
const elapsedMinutesLbl = document.getElementById("elapsed_minutes");
const elapsedSecondsLbl = document.getElementById("elapsed_seconds");
const nowTimeLbl = document.getElementById("now_time");

const startBtn = document.getElementById("startButton");
const resetBtn = document.getElementById("reset");
const wrapBtn = document.getElementById("wrap");
const wrapListDom = document.getElementById("wrapList");

// ✅ タイマー変数
let timer = null;
let startTime = 0;
let passTime = 0;
let passBackup = 0;
let wrapBackup = 0;
let wrapList = [];

let isManuallyBlocked = false;
let pauseStartTime = 0;
let pausedDuration = 0;

// ✅ ゼロ埋め関数
const zeroPad = (num, digits) => String(num).padStart(digits, "0");

// ✅ ブロック時間帯（24時間表記）
const blockedTimeRanges = [
  ["10:15", "10:25"], ["12:15", "13:00"], ["15:00", "15:10"],
  ["17:10", "17:20"], ["19:20", "19:30"], ["22:15", "22:25"],
  ["00:15", "01:00"], ["03:00", "03:10"], ["05:10", "05:20"], ["07:20", "07:30"]
];

// ✅ 現在がブロック時間か？
const isBlockedTime = () => {
  const now = new Date();
  const current = `${zeroPad(now.getHours(), 2)}:${zeroPad(now.getMinutes(), 2)}`;
  return blockedTimeRanges.some(([start, end]) => {
    if (start > end) return current >= start || current < end;
    return current >= start && current < end;
  }) || isManuallyBlocked;
};

// ✅ 現在時刻を更新 & 開始ボタンを有効に
const updateNowTime = () => {
  const now = new Date();
  const h = zeroPad(now.getHours(), 2);
  const m = zeroPad(now.getMinutes(), 2);
  const s = zeroPad(now.getSeconds(), 2);
  nowTimeLbl.innerText = `${h}時${m}分${s}秒`;

  if (isBlockedTime() && timer) {
    pauseStartTime = new Date().getTime();
    clearInterval(timer);
    timer = null;
  }

  if (!timer) {
    startBtn.disabled = false;
  }
};
setInterval(updateNowTime, 1000);
updateNowTime();

// ✅ タイマー初期化
const setupTimer = () => {
  passTime = 0;
  passBackup = 0;
  wrapBackup = 0;
  pausedDuration = 0;
  timerPar.style.color = "white";
  minutesLbl.innerText = zeroPad(0, 3);
  secondsLbl.innerText = zeroPad(0, 2);
  elapsedMinutesLbl.innerText = zeroPad(0, 2);
  elapsedSecondsLbl.innerText = zeroPad(0, 2);
};

// ✅ 経過時間取得
const getPassTime = () => {
  const currentTime = new Date().getTime();
  return passBackup + Math.floor((currentTime - startTime - pausedDuration) / 1000);
};

// ✅ カウントアップ処理
const countUp = () => {
  passTime = getPassTime();
  const totalSeconds = passTime;
  minutesLbl.innerText = zeroPad(Math.floor(totalSeconds / 60), 3);
  secondsLbl.innerText = zeroPad(totalSeconds % 60, 2);
  elapsedMinutesLbl.innerText = zeroPad(Math.floor(totalSeconds / 60), 2);
  elapsedSecondsLbl.innerText = zeroPad(totalSeconds % 60, 2);
};

// ✅ タイマー開始（ボタンが効かない問題を修正）
const startTimer = () => {
  if (timer || isBlockedTime()) return;

  startBtn.disabled = true;
  resetBtn.disabled = false;
  wrapBtn.disabled = false;

  startTime = new Date().getTime();
  timer = setInterval(() => {
    if (isBlockedTime()) {
      pauseStartTime = new Date().getTime();
      clearInterval(timer);
      timer = null;
      return;
    }
    countUp();
  }, 100);
};

// ✅ タイマーリセット
const resetTimer = () => {
  clearInterval(timer);
  timer = null;
  setupTimer();
  startBtn.disabled = false;
  resetBtn.disabled = false;
  wrapBtn.disabled = true;
  wrapList = [];
  while (wrapListDom.firstChild) {
    wrapListDom.removeChild(wrapListDom.firstChild);
  }
};

// ✅ ラップ処理（停止中でも再開）
const addWrap = () => {
  if (!timer && !isBlockedTime()) {
    startTime = new Date().getTime();
    pausedDuration = 0;
    timer = setInterval(() => {
      if (isBlockedTime()) {
        pauseStartTime = new Date().getTime();
        clearInterval(timer);
        timer = null;
        return;
      }
      countUp();
    }, 100);
  }

  const wrapTime = passTime - wrapBackup;
  wrapBackup = passTime;
  const wrapMinute = zeroPad(Math.floor(wrapTime / 60), 2);
  const wrapSecond = zeroPad(wrapTime % 60, 2);
  const wrapIndex = wrapList.length + 1;
  const text = `${wrapIndex}回目 ${wrapMinute}分${wrapSecond}秒`;
  const li = document.createElement("li");
  li.className = "wrap_item";
  li.textContent = text;
  wrapListDom.appendChild(li);
  wrapList.push(text);
  passBackup = passTime;
};

// ✅ イベント登録
window.addEventListener("load", () => {
  setupTimer();
  startBtn.addEventListener("click", startTimer);
  resetBtn.addEventListener("click", resetTimer);
  wrapBtn.addEventListener("click", addWrap);
});

// ✅ 秒クリックで手動ブロックON/OFF（内部加算も停止）
secondsLbl.addEventListener("click", () => {
  if (!isManuallyBlocked) {
    isManuallyBlocked = true;
    pauseStartTime = new Date().getTime();
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  } else {
    isManuallyBlocked = false;
    pausedDuration += new Date().getTime() - pauseStartTime;
    if (!timer && startTime !== 0) {
      timer = setInterval(countUp, 100);
    }
  }
});

console.log("✅ 修正済み script.js 読み込まれました");
