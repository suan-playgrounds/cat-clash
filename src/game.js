const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  startBtn: document.getElementById("start-btn"),
  homeBtn: document.getElementById("home-btn"),
  launchScreen: document.getElementById("launch-screen"),
  launchStartBtn: document.getElementById("launch-start-btn"),
  saveButtons: Array.from(document.querySelectorAll(".save-btn")),
  gachaBtn: document.getElementById("gacha-btn"),
  gachaCanScene: document.getElementById("gacha-can-scene"),
  codeInput: document.getElementById("code-input"),
  codeBtn: document.getElementById("code-btn"),
  codeResult: document.getElementById("code-result"),
  billCount: document.getElementById("bill-count"),
  gachaResult: document.getElementById("gacha-result"),
  unlockRoster: document.getElementById("unlock-roster"),
  levelButtons: Array.from(document.querySelectorAll(".level-btn")),
  playerBaseText: document.getElementById("player-base-text"),
  enemyBaseText: document.getElementById("enemy-base-text"),
  resourceText: document.getElementById("resource-text"),
  baseLaserBtn: document.getElementById("base-laser-btn"),
  statusText: document.getElementById("status-text"),
  overlay: document.getElementById("overlay"),
  overlayTitle: document.getElementById("overlay-title"),
  overlayMessage: document.getElementById("overlay-message"),
  summonPanel: document.getElementById("summon-panel"),
  upgradeBtn: document.getElementById("upgrade-btn"),
  upgradeCostText: document.getElementById("upgrade-cost-text"),
  unitButtons: [],
};

const KEY_BINDINGS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "a", "s", "d", "f", "g", "h"];
const UNLOCK_STORAGE_KEY = "cat-object-battle-unlocked-units";
const BILL_STORAGE_KEY = "cat-object-battle-bills";
const CODE_STORAGE_KEY = "cat-object-battle-codes";
const VIP_STORAGE_KEY = "cat-object-battle-vip";
const DEFAULT_UNLOCKED_UNITS = ["tank", "dash", "angel"];
const REDEEM_CODES = {
  FISHGIFT: { type: "bills", amount: 2, message: "지폐 2장을 받았습니다." },
  CATRAIN: { type: "unlock", unit: "battle", message: "전투상어가 즉시 해금되었습니다." },
  OCEANKING: { type: "unlock", unit: "giant", bonusBills: 3, message: "거대고래 해금 + 지폐 3장을 받았습니다." },
  "0907": { type: "vip", unit: "vipDragonFish", message: "VIP 패스와 전용 물고기 사신의 신 물고기를 획득했습니다." },
};
const LEVELS = {
  meadow: {
    key: "meadow",
    name: "새벽 초원 격돌",
    enemySpawnBase: 3.8,
    enemySpawnMin: 1.55,
    enemySpawnDecay: 0.014,
    bossSpawnStart: 52,
    bossSpawnStep: 12,
    finalBossTime: 30,
    bossPool: ["fridgeBoss"],
    finalBoss: "titanHuman",
    theme: {
      skyTop: "#7fd2ff",
      skyMid: "#d6f0ff",
      skyBottom: "#ffe0ae",
      sunX: 980,
      sunY: 120,
      mountain: "#a8b287",
      skyline: "#708089",
      groundTop: "#d5b07a",
      groundBottom: "#c07e44",
      accent: "#fff7c0",
      melody: [392, 440, 523.25, 587.33, 659.25, 587.33, 523.25, 440],
      bass: [196, 220, 196, 174.61],
    },
  },
  factory: {
    key: "factory",
    name: "폭주 공장 돌입",
    enemySpawnBase: 3.2,
    enemySpawnMin: 1.25,
    enemySpawnDecay: 0.018,
    bossSpawnStart: 38,
    bossSpawnStep: 10,
    finalBossTime: 20,
    bossPool: ["washerBoss", "microwaveBoss"],
    finalBoss: "titanHuman",
    theme: {
      skyTop: "#8db0c9",
      skyMid: "#c7d8e3",
      skyBottom: "#ffcf9d",
      sunX: 1040,
      sunY: 110,
      mountain: "#8c8b96",
      skyline: "#5a6670",
      groundTop: "#cba074",
      groundBottom: "#9a6238",
      accent: "#d9f5ff",
      melody: [329.63, 392, 440, 493.88, 523.25, 493.88, 440, 392],
      bass: [164.81, 196, 220, 196],
    },
  },
  apocalypse: {
    key: "apocalypse",
    name: "종말 도시 붕괴",
    enemySpawnBase: 2.7,
    enemySpawnMin: 0.95,
    enemySpawnDecay: 0.024,
    bossSpawnStart: 28,
    bossSpawnStep: 8,
    finalBossTime: 14,
    bossPool: ["fridgeBoss", "washerBoss", "microwaveBoss"],
    finalBoss: "titanHuman",
    theme: {
      skyTop: "#4f5674",
      skyMid: "#9d88a9",
      skyBottom: "#ff9d6b",
      sunX: 940,
      sunY: 138,
      mountain: "#65545f",
      skyline: "#3c3744",
      groundTop: "#c98d65",
      groundBottom: "#86482e",
      accent: "#ffcf9f",
      melody: [261.63, 311.13, 392, 466.16, 523.25, 466.16, 392, 311.13],
      bass: [130.81, 155.56, 174.61, 155.56],
    },
  },
  freezer: {
    key: "freezer",
    name: "냉기의 창고 습격",
    enemySpawnBase: 3.05,
    enemySpawnMin: 1.1,
    enemySpawnDecay: 0.02,
    bossSpawnStart: 34,
    bossSpawnStep: 10,
    finalBossTime: 19,
    bossPool: ["fridgeBoss", "fridgeBoss", "washerBoss"],
    finalBoss: "titanHuman",
    theme: {
      skyTop: "#a8e8ff",
      skyMid: "#e8fbff",
      skyBottom: "#d4efff",
      sunX: 1010,
      sunY: 92,
      mountain: "#c7d9e8",
      skyline: "#86a6bf",
      groundTop: "#cde7f3",
      groundBottom: "#8bb8cf",
      accent: "#ffffff",
      melody: [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 493.88],
      bass: [261.63, 293.66, 261.63, 220],
    },
  },
  neon: {
    key: "neon",
    name: "네온 야시장 난전",
    enemySpawnBase: 2.55,
    enemySpawnMin: 0.88,
    enemySpawnDecay: 0.026,
    bossSpawnStart: 30,
    bossSpawnStep: 9,
    finalBossTime: 18,
    bossPool: ["microwaveBoss", "washerBoss"],
    finalBoss: "titanHuman",
    theme: {
      skyTop: "#2a2254",
      skyMid: "#583a88",
      skyBottom: "#ff8d8d",
      sunX: 1030,
      sunY: 140,
      mountain: "#5e4580",
      skyline: "#241c3f",
      groundTop: "#c67d7d",
      groundBottom: "#8f3d5c",
      accent: "#ff70d2",
      melody: [440, 523.25, 659.25, 698.46, 659.25, 523.25, 440, 392],
      bass: [220, 261.63, 220, 196],
    },
  },
  tower: {
    key: "tower",
    name: "시계탑 대혼란",
    enemySpawnBase: 2.9,
    enemySpawnMin: 1.02,
    enemySpawnDecay: 0.021,
    bossSpawnStart: 33,
    bossSpawnStep: 9,
    finalBossTime: 17,
    bossPool: ["washerBoss", "fridgeBoss"],
    finalBoss: "titanHuman",
    theme: {
      skyTop: "#7ea6c6",
      skyMid: "#d7e7ef",
      skyBottom: "#ffd59b",
      sunX: 870,
      sunY: 124,
      mountain: "#9c8a71",
      skyline: "#6f5f5f",
      groundTop: "#d3aa75",
      groundBottom: "#a56f46",
      accent: "#fff0c1",
      melody: [349.23, 392, 440, 523.25, 440, 392, 349.23, 293.66],
      bass: [174.61, 196, 220, 196],
    },
  },
  harbor: {
    key: "harbor",
    name: "폭풍 항구 돌파",
    enemySpawnBase: 2.6,
    enemySpawnMin: 0.96,
    enemySpawnDecay: 0.024,
    bossSpawnStart: 29,
    bossSpawnStep: 8,
    finalBossTime: 16,
    bossPool: ["fridgeBoss", "microwaveBoss"],
    finalBoss: "titanHuman",
    theme: {
      skyTop: "#6eb2d8",
      skyMid: "#c2e1ef",
      skyBottom: "#ffcb8b",
      sunX: 950,
      sunY: 102,
      mountain: "#7b8d98",
      skyline: "#47606a",
      groundTop: "#cfab72",
      groundBottom: "#8d5f3c",
      accent: "#d2f3ff",
      melody: [392, 493.88, 587.33, 659.25, 587.33, 493.88, 392, 329.63],
      bass: [196, 246.94, 196, 174.61],
    },
  },
  vault: {
    key: "vault",
    name: "비밀 금고 침공",
    enemySpawnBase: 2.45,
    enemySpawnMin: 0.86,
    enemySpawnDecay: 0.027,
    bossSpawnStart: 27,
    bossSpawnStep: 8,
    finalBossTime: 15,
    bossPool: ["washerBoss", "microwaveBoss", "fridgeBoss"],
    finalBoss: "titanHuman",
    theme: {
      skyTop: "#6a5f78",
      skyMid: "#b9a8c6",
      skyBottom: "#ffd4a8",
      sunX: 1008,
      sunY: 110,
      mountain: "#8f7f70",
      skyline: "#554a56",
      groundTop: "#d0a36b",
      groundBottom: "#935b3e",
      accent: "#ffe8b8",
      melody: [329.63, 415.3, 493.88, 554.37, 493.88, 415.3, 329.63, 277.18],
      bass: [164.81, 207.65, 164.81, 138.59],
    },
  },
  core: {
    key: "core",
    name: "기계 심장 폭주",
    enemySpawnBase: 2.28,
    enemySpawnMin: 0.8,
    enemySpawnDecay: 0.03,
    bossSpawnStart: 24,
    bossSpawnStep: 7,
    finalBossTime: 12,
    bossPool: ["microwaveBoss", "washerBoss", "fridgeBoss"],
    finalBoss: "titanHuman",
    theme: {
      skyTop: "#402e50",
      skyMid: "#7a5d85",
      skyBottom: "#ff9d73",
      sunX: 925,
      sunY: 130,
      mountain: "#6d5863",
      skyline: "#312739",
      groundTop: "#c98f63",
      groundBottom: "#7f4631",
      accent: "#ffb987",
      melody: [293.66, 392, 466.16, 587.33, 466.16, 392, 293.66, 261.63],
      bass: [146.83, 196, 233.08, 196],
    },
  },
  finale: {
    key: "finale",
    name: "초지옥 대강림",
    enemySpawnBase: 2.1,
    enemySpawnMin: 0.74,
    enemySpawnDecay: 0.032,
    bossSpawnStart: 0.6,
    bossSpawnStep: 6,
    finalBossTime: 10,
    bossPool: ["fridgeBoss", "washerBoss", "microwaveBoss", "washerBoss"],
    finalBoss: "titanHuman",
    theme: {
      skyTop: "#2c203d",
      skyMid: "#6a4f78",
      skyBottom: "#ff845d",
      sunX: 960,
      sunY: 148,
      mountain: "#5b4550",
      skyline: "#251b2d",
      groundTop: "#c27f58",
      groundBottom: "#6a3829",
      accent: "#ff9e74",
      melody: [261.63, 329.63, 392, 523.25, 659.25, 523.25, 392, 329.63],
      bass: [130.81, 164.81, 196, 164.81],
    },
  },
};
const UNIT_ORDER = [
  "miniTank",
  "tank",
  "sword",
  "dash",
  "battle",
  "cannon",
  "guard",
  "ninja",
  "giant",
  "sniper",
  "hammer",
  "mage",
  "rocket",
  "laser",
  "drill",
  "angel",
  "vipDragonFish",
];

const UNIT_TYPES = {
  miniTank: {
    key: "miniTank",
    label: "꼬마복어",
    cost: 10,
    hp: 140,
    damage: 8,
    speed: 34,
    attackRange: 22,
    cooldown: 0.88,
    reach: 16,
    color: "#fffef8",
    outline: "#342118",
    accent: "#8fd16a",
    size: 28,
  },
  tank: {
    key: "tank",
    label: "방패메기",
    cost: 50,
    hp: 280,
    damage: 22,
    speed: 36,
    attackRange: 34,
    cooldown: 0.9,
    reach: 26,
    color: "#fffef8",
    outline: "#342118",
    accent: "#ef9a55",
    size: 40,
  },
  sword: {
    key: "sword",
    label: "청새치",
    cost: 90,
    hp: 170,
    damage: 40,
    speed: 54,
    attackRange: 38,
    cooldown: 0.72,
    reach: 32,
    color: "#fffefb",
    outline: "#342118",
    accent: "#ff6f61",
    size: 34,
  },
  cannon: {
    key: "cannon",
    label: "포격금붕어",
    cost: 220,
    hp: 120,
    damage: 56,
    speed: 28,
    attackRange: 170,
    cooldown: 1.32,
    reach: 80,
    color: "#fffaf1",
    outline: "#342118",
    accent: "#5f91ff",
    size: 38,
    projectile: true,
  },
  dash: {
    key: "dash",
    label: "질주고등어",
    cost: 120,
    hp: 120,
    damage: 34,
    speed: 108,
    attackRange: 24,
    cooldown: 0.42,
    reach: 22,
    color: "#fffef8",
    outline: "#342118",
    accent: "#ffb347",
    size: 30,
  },
  battle: {
    key: "battle",
    label: "전투상어",
    cost: 200,
    hp: 150,
    damage: 62,
    speed: 34,
    attackRange: 310,
    cooldown: 1.05,
    reach: 124,
    color: "#fffdf6",
    outline: "#342118",
    accent: "#f64674",
    size: 36,
    projectile: true,
  },
  guard: {
    key: "guard",
    label: "철갑가오리",
    cost: 130,
    hp: 360,
    damage: 16,
    speed: 26,
    attackRange: 28,
    cooldown: 0.78,
    reach: 18,
    color: "#fffdf6",
    outline: "#342118",
    accent: "#6aa4ff",
    size: 42,
  },
  ninja: {
    key: "ninja",
    label: "닌자날치",
    cost: 150,
    hp: 110,
    damage: 42,
    speed: 94,
    attackRange: 26,
    cooldown: 0.34,
    reach: 30,
    color: "#fffdf6",
    outline: "#342118",
    accent: "#2f2f2f",
    size: 30,
  },
  giant: {
    key: "giant",
    label: "거대고래",
    cost: 320,
    hp: 520,
    damage: 68,
    speed: 22,
    attackRange: 42,
    cooldown: 1.26,
    reach: 36,
    color: "#fff9ef",
    outline: "#342118",
    accent: "#7a5cff",
    size: 52,
  },
  sniper: {
    key: "sniper",
    label: "저격황새치",
    cost: 280,
    hp: 120,
    damage: 104,
    speed: 22,
    attackRange: 360,
    cooldown: 1.8,
    reach: 144,
    color: "#fffdf6",
    outline: "#342118",
    accent: "#4bdc9f",
    size: 34,
    projectile: true,
  },
  hammer: {
    key: "hammer",
    label: "망치상어",
    cost: 230,
    hp: 260,
    damage: 88,
    speed: 30,
    attackRange: 36,
    cooldown: 1.12,
    reach: 42,
    color: "#fffdf6",
    outline: "#342118",
    accent: "#ff9d4d",
    size: 42,
  },
  mage: {
    key: "mage",
    label: "마법베타",
    cost: 240,
    hp: 130,
    damage: 58,
    speed: 24,
    attackRange: 220,
    cooldown: 1.06,
    reach: 98,
    color: "#fffdf6",
    outline: "#342118",
    accent: "#9c6bff",
    size: 36,
    projectile: true,
  },
  rocket: {
    key: "rocket",
    label: "로켓참치",
    cost: 260,
    hp: 150,
    damage: 76,
    speed: 40,
    attackRange: 200,
    cooldown: 1.18,
    reach: 90,
    color: "#fffdf6",
    outline: "#342118",
    accent: "#ff5f5f",
    size: 38,
    projectile: true,
  },
  laser: {
    key: "laser",
    label: "레이저이엘",
    cost: 340,
    hp: 160,
    damage: 92,
    speed: 26,
    attackRange: 420,
    cooldown: 1.48,
    reach: 170,
    color: "#fffdf6",
    outline: "#342118",
    accent: "#57d7ff",
    size: 40,
    projectile: true,
  },
  drill: {
    key: "drill",
    label: "드릴철갑상어",
    cost: 190,
    hp: 210,
    damage: 46,
    speed: 64,
    attackRange: 30,
    cooldown: 0.62,
    reach: 34,
    color: "#fffdf6",
    outline: "#342118",
    accent: "#ffce57",
    size: 34,
  },
  angel: {
    key: "angel",
    label: "천사엔젤피쉬",
    cost: 290,
    hp: 240,
    damage: 70,
    speed: 48,
    attackRange: 210,
    cooldown: 1.08,
    reach: 92,
    color: "#fffdf6",
    outline: "#342118",
    accent: "#ffd86b",
    size: 38,
    projectile: true,
  },
  vipDragonFish: {
    key: "vipDragonFish",
    label: "사신의 신 물고기",
    cost: 450,
    hp: 420,
    damage: 138,
    speed: 44,
    attackRange: 360,
    cooldown: 0.86,
    reach: 180,
    color: "#fff6cf",
    outline: "#342118",
    accent: "#ffcc3d",
    size: 52,
    projectile: true,
    vipOnly: true,
    laserMouth: true,
  },
};

const ENEMY_TYPES = [
  {
    key: "box",
    name: "골목냥",
    hp: 130,
    damage: 20,
    speed: 42,
    attackRange: 34,
    cooldown: 0.95,
    reach: 24,
    size: 30,
    color: "#7c614d",
    accent: "#f0c36a",
  },
  {
    key: "kettle",
    name: "주전자냥",
    hp: 240,
    damage: 34,
    speed: 30,
    attackRange: 40,
    cooldown: 1.18,
    reach: 30,
    size: 38,
    color: "#5c6a78",
    accent: "#8be0ff",
  },
  {
    key: "speaker",
    name: "스피커냥",
    hp: 110,
    damage: 26,
    speed: 56,
    attackRange: 150,
    cooldown: 1.3,
    reach: 76,
    size: 28,
    color: "#343434",
    accent: "#ff7a7a",
    projectile: true,
  },
  {
    key: "lamp",
    name: "램프냥",
    hp: 150,
    damage: 22,
    speed: 48,
    attackRange: 40,
    cooldown: 0.88,
    reach: 24,
    size: 32,
    color: "#d8c58d",
    accent: "#fff1a2",
  },
  {
    key: "fan",
    name: "선풍냥",
    hp: 180,
    damage: 28,
    speed: 66,
    attackRange: 48,
    cooldown: 0.62,
    reach: 24,
    size: 34,
    color: "#8fa3b5",
    accent: "#d4f3ff",
  },
  {
    key: "vacuum",
    name: "청소냥",
    hp: 300,
    damage: 42,
    speed: 34,
    attackRange: 46,
    cooldown: 1.06,
    reach: 30,
    size: 40,
    color: "#a53d53",
    accent: "#ffc169",
  },
  {
    key: "toaster",
    name: "토스터냥",
    hp: 120,
    damage: 38,
    speed: 28,
    attackRange: 180,
    cooldown: 1.22,
    reach: 88,
    size: 30,
    color: "#b6b6b6",
    accent: "#ffb06a",
    projectile: true,
  },
  {
    key: "clock",
    name: "시계냥",
    hp: 220,
    damage: 30,
    speed: 54,
    attackRange: 38,
    cooldown: 0.7,
    reach: 28,
    size: 34,
    color: "#c6924f",
    accent: "#fff0b0",
  },
];

const ENEMY_BOSS_TYPES = {
  fridgeBoss: {
    key: "fridgeBoss",
    name: "냉장고대장냥",
    hp: 1400,
    damage: 68,
    speed: 18,
    attackRange: 58,
    cooldown: 1.08,
    reach: 42,
    size: 68,
    color: "#d9e0e8",
    accent: "#7fd7ff",
    boss: true,
  },
  washerBoss: {
    key: "washerBoss",
    name: "세탁냥장군",
    hp: 1100,
    damage: 54,
    speed: 24,
    attackRange: 220,
    cooldown: 1.36,
    reach: 98,
    size: 62,
    color: "#788fa6",
    accent: "#9ff4ff",
    projectile: true,
    boss: true,
  },
  microwaveBoss: {
    key: "microwaveBoss",
    name: "전자레인지왕냥",
    hp: 900,
    damage: 84,
    speed: 28,
    attackRange: 52,
    cooldown: 0.9,
    reach: 44,
    size: 60,
    color: "#4b4b56",
    accent: "#ff9b5c",
    boss: true,
  },
};

const FINAL_BOSS_TYPES = {
  titanHuman: {
    key: "titanHuman",
    name: "타이탄 휴먼",
    hp: 725,
    damage: 120,
    speed: 18,
    attackRange: 240,
    cooldown: 0.96,
    reach: 118,
    size: 118,
    color: "#8a8f99",
    accent: "#ff4f4f",
    boss: true,
  },
};

const WORLD = {
  width: 1280,
  height: 720,
  laneY: 530,
  laneH: 110,
  playerBaseX: 116,
  enemyBaseX: 1164,
};

const fishImageCache = new Map();

let selectedLevelKey = "meadow";
const state = createInitialState();
let rafId = 0;
let lastTs = 0;
let nextUnitId = 1;
let audioCtx = null;
let musicTimer = 0;
let musicStep = 0;
let musicEnabled = true;
let baseLaserBeams = [];
let gachaAnimating = false;
let selectedSaveSlot = "slot1";
let unlockedUnitKeys = loadUnlockedUnits();
let billCount = loadBills();
let redeemedCodes = loadRedeemedCodes();
let vipUnlocked = loadVipStatus();

function createSpawnCooldowns() {
  return Object.fromEntries(UNIT_ORDER.map((key) => [key, 0]));
}

function loadUnlockedUnits() {
  try {
    const raw = window.localStorage.getItem(`${UNLOCK_STORAGE_KEY}-${selectedSaveSlot}`);
    const parsed = raw ? JSON.parse(raw) : [];
    const merged = [...new Set([...DEFAULT_UNLOCKED_UNITS, ...parsed])];
    return UNIT_ORDER.filter((key) => merged.includes(key));
  } catch {
    return [...DEFAULT_UNLOCKED_UNITS];
  }
}

function saveUnlockedUnits() {
  try {
    window.localStorage.setItem(`${UNLOCK_STORAGE_KEY}-${selectedSaveSlot}`, JSON.stringify(unlockedUnitKeys));
  } catch {}
}

function loadBills() {
  try {
    const raw = window.localStorage.getItem(`${BILL_STORAGE_KEY}-${selectedSaveSlot}`);
    return Math.max(0, Number.parseInt(raw || "0", 10) || 0);
  } catch {
    return 0;
  }
}

function saveBills() {
  try {
    window.localStorage.setItem(`${BILL_STORAGE_KEY}-${selectedSaveSlot}`, String(billCount));
  } catch {}
}

function loadRedeemedCodes() {
  try {
    const raw = window.localStorage.getItem(`${CODE_STORAGE_KEY}-${selectedSaveSlot}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRedeemedCodes() {
  try {
    window.localStorage.setItem(`${CODE_STORAGE_KEY}-${selectedSaveSlot}`, JSON.stringify(redeemedCodes));
  } catch {}
}

function loadVipStatus() {
  try {
    return window.localStorage.getItem(`${VIP_STORAGE_KEY}-${selectedSaveSlot}`) === "true";
  } catch {
    return false;
  }
}

function saveVipStatus() {
  try {
    window.localStorage.setItem(`${VIP_STORAGE_KEY}-${selectedSaveSlot}`, vipUnlocked ? "true" : "false");
  } catch {}
}

function selectSaveSlot(slotKey) {
  selectedSaveSlot = slotKey;
  unlockedUnitKeys = loadUnlockedUnits();
  billCount = loadBills();
  redeemedCodes = loadRedeemedCodes();
  vipUnlocked = loadVipStatus();
  for (const button of ui.saveButtons) {
    button.classList.toggle("selected", button.dataset.save === slotKey);
  }
  renderUnlockRoster();
  renderUnitButtons();
  ui.gachaResult.textContent = `${slotKey.toUpperCase()} 사용 중. 기본 해금: 방패메기, 질주고등어, 천사엔젤피쉬`;
  if (ui.codeResult) {
    ui.codeResult.textContent = vipUnlocked
      ? `VIP 활성화됨. 사용 가능한 코드 수: ${Object.keys(REDEEM_CODES).length}개`
      : `사용 가능한 코드 수: ${Object.keys(REDEEM_CODES).length}개`;
  }
}

function getAvailableUnitOrder() {
  return UNIT_ORDER.filter((key) => unlockedUnitKeys.includes(key));
}

function getUnitTagline(type) {
  const taglines = {
    miniTank: "10 · 초저가 탱커",
    tank: "50 · 싸고 튼튼한 전열",
    sword: "90 · 기본 근접 딜러",
    dash: "120 · 초고속 돌격",
    battle: "200 · 엄청 긴 사거리",
    cannon: "220 · 후방 포격",
    guard: "130 · 전선 유지",
    ninja: "150 · 빠른 연타",
    giant: "320 · 초중량 탱커",
    sniper: "280 · 초장거리 저격",
    hammer: "230 · 강력한 한방",
    mage: "240 · 마법 원거리",
    rocket: "260 · 기동 포격",
    laser: "340 · 최장 레이저",
    drill: "190 · 파고드는 전사",
    angel: "290 · 빛의 탄막",
    vipDragonFish: "450 · 입에서 레이저를 쏘는 VIP 전용 신어",
  };
  return taglines[type.key] || `${type.cost} · 물고기 출격`;
}

function renderUnitButtons() {
  const upgradeBtn = ui.upgradeBtn;
  upgradeBtn.remove();
  ui.summonPanel.querySelectorAll(".unit-btn[data-unit]").forEach((button) => button.remove());

  const availableUnits = getAvailableUnitOrder();
  for (const key of availableUnits) {
    const type = UNIT_TYPES[key];
    const hotkey = KEY_BINDINGS[availableUnits.indexOf(key)] || "?";
    const button = document.createElement("button");
    button.className = "unit-btn";
    button.type = "button";
    button.dataset.unit = key;
    button.innerHTML = `<span>${hotkey.toUpperCase()}. ${type.label}</span><strong>${type.cost}</strong><small>${getUnitTagline(type)}</small>`;
    button.addEventListener("click", () => spawnPlayerUnit(key));
    ui.summonPanel.appendChild(button);
  }

  ui.summonPanel.appendChild(upgradeBtn);
  ui.unitButtons = Array.from(document.querySelectorAll(".unit-btn[data-unit]"));
}

function renderUnlockRoster() {
  ui.billCount.textContent = `보유 지폐: ${billCount}장`;
  ui.unlockRoster.innerHTML = "";
  for (const key of UNIT_ORDER) {
    const chip = document.createElement("div");
    const unlocked = unlockedUnitKeys.includes(key);
    chip.className = `unlock-chip${unlocked ? "" : " locked"}`;
    const vipTag = UNIT_TYPES[key].vipOnly ? " [VIP]" : "";
    chip.textContent = `${unlocked ? "해금" : "잠금"} · ${UNIT_TYPES[key].label}${vipTag}`;
    ui.unlockRoster.appendChild(chip);
  }
}

function performGacha() {
  if (gachaAnimating) {
    return;
  }
  if (billCount < 1) {
    ui.gachaResult.textContent = "지폐가 부족합니다. 레벨을 클리어해서 지폐를 모아보세요.";
    return;
  }
  const pool = UNIT_ORDER.filter((key) => !DEFAULT_UNLOCKED_UNITS.includes(key) && !unlockedUnitKeys.includes(key));
  if (pool.length === 0) {
    ui.gachaResult.textContent = "모든 뽑기 유닛을 이미 해금했습니다.";
    return;
  }
  gachaAnimating = true;
  ui.gachaBtn.disabled = true;
  ui.gachaBtn.classList.add("disabled");
  ui.gachaResult.textContent = "통조림이 빛나고 있습니다...";
  playGachaCanAnimation();

  window.setTimeout(() => {
    billCount -= 1;
    saveBills();
    const picked = pool[Math.floor(Math.random() * pool.length)];
    unlockedUnitKeys = [...unlockedUnitKeys, picked];
    saveUnlockedUnits();
    renderUnlockRoster();
    renderUnitButtons();
    ui.gachaResult.textContent = `통조림이 열리며 ${UNIT_TYPES[picked].label} 해금!`;
    ui.gachaBtn.disabled = false;
    ui.gachaBtn.classList.remove("disabled");
    gachaAnimating = false;
  }, 1120);
}

function playGachaCanAnimation() {
  if (!ui.gachaCanScene) {
    return;
  }
  ui.gachaCanScene.classList.remove("is-opening");
  void ui.gachaCanScene.offsetWidth;
  ui.gachaCanScene.classList.add("is-opening");
  window.setTimeout(() => {
    ui.gachaCanScene.classList.remove("is-opening");
  }, 1180);
}

function redeemCode() {
  if (!ui.codeInput || !ui.codeResult) {
    return;
  }
  const code = ui.codeInput.value.trim().toUpperCase();
  if (!code) {
    ui.codeResult.textContent = "코드를 입력해 주세요.";
    return;
  }
  if (redeemedCodes.includes(code)) {
    ui.codeResult.textContent = "이미 사용한 코드입니다.";
    return;
  }
  const reward = REDEEM_CODES[code];
  if (!reward) {
    ui.codeResult.textContent = "없는 코드입니다.";
    return;
  }

  if (reward.type === "bills") {
    billCount += reward.amount;
    saveBills();
  }
  if (reward.type === "unlock" && reward.unit && !unlockedUnitKeys.includes(reward.unit)) {
    unlockedUnitKeys = [...unlockedUnitKeys, reward.unit];
    saveUnlockedUnits();
  }
  if (reward.bonusBills) {
    billCount += reward.bonusBills;
    saveBills();
  }
  if (reward.type === "vip") {
    vipUnlocked = true;
    saveVipStatus();
    if (reward.unit && !unlockedUnitKeys.includes(reward.unit)) {
      unlockedUnitKeys = [...unlockedUnitKeys, reward.unit];
      saveUnlockedUnits();
    }
  }

  redeemedCodes = [...redeemedCodes, code];
  saveRedeemedCodes();
  renderUnlockRoster();
  renderUnitButtons();
  ui.codeInput.value = "";
  ui.codeResult.textContent = `${code} 성공! ${reward.message}`;
}

function createInitialState() {
  const level = LEVELS[selectedLevelKey];
  return {
    mode: "ready",
    elapsed: 0,
    message: "Start를 누르면 전투가 시작됩니다.",
    winner: null,
    income: 22,
    incomeLevel: 1,
    incomeUpgradeCost: 120,
    cost: 220,
    maxCost: 360,
    spawnCooldowns: createSpawnCooldowns(),
    playerBase: { hp: 1200, maxHp: 1200, x: WORLD.playerBaseX, y: WORLD.laneY, size: 86 },
    enemyBase: { hp: 1200, maxHp: 1200, x: WORLD.enemyBaseX, y: WORLD.laneY, size: 86 },
    units: [],
    enemyUnits: [],
    projectiles: [],
    selectedLevelKey,
    enemySpawnTimer: level.enemySpawnBase,
    enemyWave: 0,
    bossSpawnTimer: level.bossSpawnStart,
    bossesSpawned: 0,
    finalBossTimer: level.finalBossTime,
    finalBossSpawned: false,
    baseLaserCooldown: 0,
    rewardGranted: false,
    dust: [],
  };
}

function resetState() {
  const fresh = createInitialState();
  nextUnitId = 1;
  baseLaserBeams = [];
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, fresh);
  setOverlay("전투 준비", "버튼이나 숫자키로 물고기를 뽑아 적 기지를 밀어보세요.", true);
  syncHud();
  render();
}

function startGame() {
  resetState();
  state.mode = "playing";
  state.message = `${LEVELS[selectedLevelKey].name} 시작! 코스트를 모아 라인을 밀어내세요.`;
  setOverlay("", "", false);
  ui.launchScreen.classList.add("hidden");
  ensureMusic();
  syncHud();
}

function returnToLaunch() {
  state.mode = "ready";
  setOverlay("전투 준비", "레벨을 다시 고르고 처음부터 출격하세요.", true);
  ui.launchScreen.classList.remove("hidden");
  state.message = "메인 화면으로 돌아왔습니다.";
  syncHud();
  render();
}

function selectLevel(levelKey) {
  if (!LEVELS[levelKey]) {
    return;
  }
  selectedLevelKey = levelKey;
  for (const button of ui.levelButtons) {
    button.classList.toggle("selected", button.dataset.level === levelKey);
  }
  state.message = `${LEVELS[levelKey].name} 선택됨`;
  ui.statusText.textContent = state.message;
}

function spawnPlayerUnit(typeKey) {
  const type = UNIT_TYPES[typeKey];
  if (!type || state.mode !== "playing") {
    return;
  }

  if (state.cost < type.cost) {
    state.message = `${type.label} 소환 코스트가 부족합니다.`;
    syncHud();
    return;
  }

  if (state.spawnCooldowns[typeKey] > 0) {
    state.message = `${type.label} 소환 대기 중입니다.`;
    syncHud();
    return;
  }

  state.cost -= type.cost;
  state.spawnCooldowns[typeKey] = 1.1;
  state.units.push(createUnit(type, "player"));
  state.message = `${type.label} 출격!`;
  syncHud();
}

function upgradeIncome() {
  if (state.mode !== "playing") {
    return;
  }

  if (state.cost < state.incomeUpgradeCost) {
    state.message = "수입 강화 코스트가 부족합니다.";
    syncHud();
    return;
  }

  state.cost -= state.incomeUpgradeCost;
  state.incomeLevel += 1;
  state.income += 8;
  state.maxCost += 55;
  state.incomeUpgradeCost = Math.min(360, state.incomeUpgradeCost + 70);
  state.message = `수입 레벨 ${state.incomeLevel} 달성!`;
  syncHud();
}

function createUnit(type, team) {
  const dir = team === "player" ? 1 : -1;
  const startX = team === "player" ? WORLD.playerBaseX + 62 : WORLD.enemyBaseX - 62;

  return {
    id: `unit-${nextUnitId++}`,
    team,
    type: type.key || type.name.toLowerCase(),
    label: type.label || type.name,
    x: startX,
    y: WORLD.laneY,
    hp: type.hp,
    maxHp: type.hp,
    damage: type.damage,
    speed: type.speed,
    attackRange: type.attackRange,
    cooldown: type.cooldown,
    reach: type.reach,
    size: type.size,
    color: type.color,
    outline: team === "player" ? "#3f2315" : "#241719",
    accent: type.accent,
    projectile: Boolean(type.projectile),
    dir,
    attackTimer: Math.random() * 0.35,
    bob: Math.random() * Math.PI * 2,
  };
}

function spawnEnemy() {
  const unlockCount = Math.min(ENEMY_TYPES.length, 3 + Math.floor(state.elapsed / 18));
  const pool = ENEMY_TYPES.slice(0, unlockCount);
  const type = pool[Math.floor(Math.random() * pool.length)];
  state.enemyUnits.push(createUnit(type, "enemy"));
  state.enemyWave += 1;
}

function spawnBoss() {
  const level = LEVELS[state.selectedLevelKey];
  const bossKey = level.bossPool[state.bossesSpawned % level.bossPool.length];
  const type = ENEMY_BOSS_TYPES[bossKey];
  const boss = createUnit(type, "enemy");
  state.enemyUnits.push(boss);
  state.bossesSpawned += 1;
  state.message = `보스 등장! ${type.name}가 전선에 나타났습니다.`;
  triggerBossEntrance(boss);
}

function spawnFinalBoss() {
  const finalBossType = FINAL_BOSS_TYPES[LEVELS[state.selectedLevelKey].finalBoss];
  const boss = createUnit(finalBossType, "enemy");
  state.enemyUnits.push(boss);
  state.finalBossSpawned = true;
  state.message = `최종보스 등장! ${finalBossType.name}이 전장에 강림했습니다.`;
  triggerBossEntrance(boss);
}

function triggerBossEntrance(boss) {
  ensureMusic();
  playBossEntranceSting();
  knockbackAllUnits(boss);
  state.dust.push({
    x: boss.x - 70,
    y: boss.y - 30,
    life: 0.52,
    radius: 56,
    color: "#ff8a6e",
  });
  state.dust.push({
    x: boss.x - 18,
    y: boss.y - 72,
    life: 0.48,
    radius: 44,
    color: "#ffd166",
  });
}

function knockbackAllUnits(boss) {
  for (const unit of state.units) {
    unit.x = WORLD.playerBaseX + 64 + Math.random() * 18;
    unit.attackTimer = Math.max(unit.attackTimer, 0.9);
  }

  for (const enemy of state.enemyUnits) {
    if (enemy.id === boss.id) {
      continue;
    }
    enemy.x = WORLD.enemyBaseX - 64 - Math.random() * 18;
    enemy.attackTimer = Math.max(enemy.attackTimer, 0.75);
  }
}

function update(dt) {
  if (state.mode !== "playing") {
    return;
  }

  state.elapsed += dt;
  state.cost = Math.min(state.maxCost, state.cost + state.income * dt);

  Object.keys(state.spawnCooldowns).forEach((key) => {
    state.spawnCooldowns[key] = Math.max(0, state.spawnCooldowns[key] - dt);
  });
  state.baseLaserCooldown = Math.max(0, state.baseLaserCooldown - dt);
  updateBaseLaserBeams(dt);

  tickMusic(dt);

  state.enemySpawnTimer -= dt;
  if (state.enemySpawnTimer <= 0) {
    spawnEnemy();
    const level = LEVELS[state.selectedLevelKey];
    const tension = Math.max(level.enemySpawnMin, level.enemySpawnBase - state.elapsed * level.enemySpawnDecay);
    state.enemySpawnTimer = tension + Math.random() * 0.7;
  }

  state.bossSpawnTimer -= dt;
  if (state.bossSpawnTimer <= 0) {
    spawnBoss();
    state.bossSpawnTimer = LEVELS[state.selectedLevelKey].bossSpawnStart + state.bossesSpawned * LEVELS[state.selectedLevelKey].bossSpawnStep;
  }

  if (!state.finalBossSpawned) {
    state.finalBossTimer -= dt;
    if (state.finalBossTimer <= 0) {
      spawnFinalBoss();
    }
  }

  updateArmy(state.units, state.enemyUnits, state.enemyBase, dt);
  updateArmy(state.enemyUnits, state.units, state.playerBase, dt);
  updateProjectiles(dt);
  updateDust(dt);
  cleanDeadUnits();
  checkGameOver();
  syncHud();
}

function updateArmy(allies, enemies, enemyBase, dt) {
  for (const unit of allies) {
    unit.attackTimer = Math.max(0, unit.attackTimer - dt);
    unit.bob += dt * 8;

    const target = findClosestTarget(unit, enemies, enemyBase);
    const distance = Math.abs(target.x - unit.x);
    const desiredGap = unit.attackRange + (target.size || 58) * 0.45;

    if (distance > desiredGap) {
      unit.x += unit.speed * unit.dir * dt;
      const minX = WORLD.playerBaseX + 55;
      const maxX = WORLD.enemyBaseX - 55;
      unit.x = Math.min(maxX, Math.max(minX, unit.x));
      continue;
    }

    if (unit.attackTimer > 0) {
      continue;
    }

    unit.attackTimer = unit.cooldown;

    if (unit.projectile) {
      const isMouthLaser = unit.type === "vipDragonFish";
      state.projectiles.push({
        x: unit.x + unit.dir * (isMouthLaser ? unit.size * 0.78 : unit.size * 0.55),
        y: unit.y - unit.size * (isMouthLaser ? 0.16 : 0.6),
        dir: unit.dir,
        speed: isMouthLaser ? 520 : 250,
        damage: unit.damage,
        rangeLeft: unit.attackRange + (isMouthLaser ? 150 : 80),
        team: unit.team,
        color: isMouthLaser ? "#7ce9ff" : unit.accent,
        radius: isMouthLaser ? 14 : 8,
        beam: isMouthLaser,
        width: isMouthLaser ? 10 : 0,
        hitIds: [],
        baseHit: false,
      });
    } else {
      target.hp -= unit.damage;
      state.dust.push({
        x: target.x - unit.dir * 10,
        y: target.y - 20,
        life: 0.28,
        radius: 22,
        color: unit.accent,
      });
    }
  }
}

function findClosestTarget(unit, enemies, enemyBase) {
  let best = enemyBase;

  let bestDistance = Math.abs(best.x - unit.x);
  for (const enemy of enemies) {
    const distance = Math.abs(enemy.x - unit.x);
    if (distance < bestDistance) {
      best = enemy;
      bestDistance = distance;
    }
  }
  return best;
}

function updateProjectiles(dt) {
  for (const projectile of state.projectiles) {
    projectile.x += projectile.speed * projectile.dir * dt;
    projectile.rangeLeft -= projectile.speed * dt;

    const targets = projectile.team === "player" ? state.enemyUnits : state.units;
    const base = projectile.team === "player" ? state.enemyBase : state.playerBase;
    const baseX = projectile.team === "player" ? WORLD.enemyBaseX : WORLD.playerBaseX;

    if (projectile.beam) {
      for (const target of targets) {
        if (projectile.hitIds.includes(target.id)) {
          continue;
        }
        if (Math.abs(projectile.x - target.x) <= target.size * 0.8) {
          target.hp -= projectile.damage;
          projectile.hitIds.push(target.id);
          state.dust.push({
            x: target.x,
            y: target.y - target.size * 0.6,
            life: 0.3,
            radius: target.boss ? 34 : 26,
            color: projectile.color,
          });
        }
      }

      if (!projectile.baseHit && Math.abs(projectile.x - baseX) < 46) {
        base.hp -= projectile.damage;
        projectile.baseHit = true;
        projectile.rangeLeft = -1;
        state.dust.push({
          x: baseX,
          y: WORLD.laneY - 64,
          life: 0.36,
          radius: 30,
          color: projectile.color,
        });
      }
      continue;
    }

    let hit = null;
    for (const target of targets) {
      if (Math.abs(projectile.x - target.x) <= target.size * 0.65) {
        hit = target;
        break;
      }
    }

    if (hit) {
      hit.hp -= projectile.damage;
      projectile.rangeLeft = -1;
      state.dust.push({
        x: hit.x,
        y: hit.y - hit.size * 0.6,
        life: 0.3,
        radius: 26,
        color: projectile.color,
      });
      continue;
    }

    if (Math.abs(projectile.x - baseX) < 46) {
      base.hp -= projectile.damage;
      projectile.rangeLeft = -1;
      state.dust.push({
        x: baseX,
        y: WORLD.laneY - 64,
        life: 0.36,
        radius: 30,
        color: projectile.color,
      });
    }
  }

  state.projectiles = state.projectiles.filter((projectile) => projectile.rangeLeft > 0);
}

function updateDust(dt) {
  for (const puff of state.dust) {
    puff.life -= dt;
    puff.radius += 40 * dt;
  }
  state.dust = state.dust.filter((puff) => puff.life > 0);
}

function updateBaseLaserBeams(dt) {
  for (const beam of baseLaserBeams) {
    beam.life -= dt;
  }
  baseLaserBeams = baseLaserBeams.filter((beam) => beam.life > 0);
}

function cleanDeadUnits() {
  state.units = state.units.filter((unit) => unit.hp > 0);
  state.enemyUnits = state.enemyUnits.filter((unit) => unit.hp > 0);
  state.playerBase.hp = Math.max(0, state.playerBase.hp);
  state.enemyBase.hp = Math.max(0, state.enemyBase.hp);
}

function checkGameOver() {
  if (state.playerBase.hp <= 0) {
    state.mode = "gameover";
    state.winner = "enemy";
    state.message = "아군 기지가 무너졌습니다. R로 재도전하세요.";
    setOverlay("패배", "적의 공세를 막지 못했습니다. 다시 배치를 조정해 보세요.", true);
  } else if (state.enemyBase.hp <= 0) {
    state.mode = "gameover";
    state.winner = "player";
    if (!state.rewardGranted) {
      billCount += 1;
      saveBills();
      state.rewardGranted = true;
    }
    state.message = "승리! 적 기지를 무너뜨렸습니다.";
    renderUnlockRoster();
    setOverlay("승리", "물고기 군단이 적 기지를 파괴했습니다. 지폐 1장을 획득했습니다. R을 눌러 다시 시작하세요.", true);
  }
}

function syncHud() {
  ui.playerBaseText.textContent = `${Math.ceil(state.playerBase.hp)} / ${state.playerBase.maxHp}`;
  ui.enemyBaseText.textContent = `${Math.ceil(state.enemyBase.hp)} / ${state.enemyBase.maxHp}`;
  ui.resourceText.textContent = `${Math.floor(state.cost)} / ${state.maxCost} · +${state.income}/s`;
  ui.statusText.textContent = state.message;
  ui.upgradeCostText.textContent = `${state.incomeUpgradeCost}`;
  ui.baseLaserBtn.textContent = state.baseLaserCooldown > 0 ? `E. 레이저 ${Math.ceil(state.baseLaserCooldown)}s` : "E. 베이스 레이저";
  ui.baseLaserBtn.classList.toggle("disabled", state.baseLaserCooldown > 0 || state.mode !== "playing");

  for (const btn of ui.unitButtons) {
    const type = UNIT_TYPES[btn.dataset.unit];
    const available = state.cost >= type.cost && state.spawnCooldowns[type.key] <= 0 && state.mode === "playing";
    btn.classList.toggle("disabled", !available);
  }

  const canUpgrade = state.cost >= state.incomeUpgradeCost && state.mode === "playing";
  ui.upgradeBtn.classList.toggle("disabled", !canUpgrade);
}

function ensureMusic() {
  if (!musicEnabled) {
    return;
  }

  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }
    audioCtx = new AudioContextClass();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  if (!musicEnabled && audioCtx) {
    audioCtx.suspend().catch(() => {});
    state.message = "배경음악을 껐습니다.";
  } else {
    ensureMusic();
    state.message = "배경음악을 켰습니다.";
  }
  syncHud();
}

function tickMusic(dt) {
  if (!musicEnabled || !audioCtx || audioCtx.state !== "running") {
    return;
  }

  musicTimer -= dt;
  while (musicTimer <= 0) {
    playMusicStep(musicStep);
    musicStep = (musicStep + 1) % 16;
    musicTimer += 0.32;
  }
}

function playMusicStep(step) {
  const theme = LEVELS[state.selectedLevelKey].theme;
  const melody = theme.melody;
  const bass = theme.bass;
  const now = audioCtx.currentTime + 0.02;

  playPianoNote(melody[step % melody.length], now, 0.62, 0.16);
  if (step % 2 === 0) {
    playPianoNote(bass[step % bass.length], now, 0.9, 0.11);
  }
}

function playPianoNote(freq, start, duration, gainAmount) {
  const master = audioCtx.createGain();
  const lowpass = audioCtx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.setValueAtTime(2200, start);
  lowpass.Q.setValueAtTime(0.7, start);

  master.gain.setValueAtTime(0.0001, start);
  master.gain.exponentialRampToValueAtTime(gainAmount, start + 0.01);
  master.gain.exponentialRampToValueAtTime(gainAmount * 0.38, start + 0.08);
  master.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  const partials = [
    { type: "triangle", ratio: 1, gain: 1 },
    { type: "sine", ratio: 2, gain: 0.32 },
    { type: "sine", ratio: 3, gain: 0.14 },
  ];

  for (const partial of partials) {
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = partial.type;
    osc.frequency.setValueAtTime(freq * partial.ratio, start);
    oscGain.gain.setValueAtTime(partial.gain, start);
    osc.connect(oscGain);
    oscGain.connect(lowpass);
    osc.start(start);
    osc.stop(start + duration + 0.08);
  }

  lowpass.connect(master);
  master.connect(audioCtx.destination);
}

function playBossEntranceSting() {
  if (!audioCtx || audioCtx.state !== "running") {
    return;
  }

  const now = audioCtx.currentTime + 0.01;
  playDrumHit(110, now, 0.34, 0.28);
  playDrumHit(82, now + 0.18, 0.48, 0.36);
}

function playDrumHit(freq, start, duration, gainAmount) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(420, start);
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(38, freq * 0.45), start + duration);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainAmount, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

function setOverlay(title, message, visible) {
  ui.overlayTitle.textContent = title;
  ui.overlayMessage.textContent = message;
  ui.overlay.classList.toggle("visible", visible);
}

function drawUnitName(unit, yTop) {
  const text = unit.label;
  ctx.save();
  ctx.font = '14px "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
  const width = ctx.measureText(text).width + 16;
  const x = unit.x - width / 2;
  const y = yTop - 20;
  const isFinalBoss = unit.type === "titanHuman";
  ctx.fillStyle = isFinalBoss
    ? "rgba(182, 24, 46, 0.96)"
    : unit.team === "player"
      ? "rgba(255, 248, 232, 0.94)"
      : "rgba(52, 40, 44, 0.94)";
  ctx.strokeStyle = isFinalBoss
    ? "rgba(255, 214, 214, 0.95)"
    : unit.team === "player"
      ? "rgba(70, 41, 26, 0.9)"
      : "rgba(255, 218, 194, 0.9)";
  ctx.lineWidth = 2;
  roundRect(x, y, width, 20, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = isFinalBoss ? "#fff7f7" : unit.team === "player" ? "#2e1f1b" : "#fff2dc";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, unit.x, y + 10.5);
  ctx.restore();
}

function drawBase(x, team, hpRatio) {
  const width = 112;
  const height = 154;
  const left = x - width / 2;
  const top = WORLD.laneY - height + 8;
  const body = team === "player" ? "#fff8e7" : "#3f2d35";
  const roof = team === "player" ? "#f1834f" : "#8a5962";

  ctx.fillStyle = body;
  roundRect(left, top + 28, width, height - 28, 24);
  ctx.fill();
  ctx.fillStyle = roof;
  ctx.beginPath();
  ctx.moveTo(left + 14, top + 38);
  ctx.lineTo(left + width / 2, top);
  ctx.lineTo(left + width - 14, top + 38);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = team === "player" ? "#251918" : "#fef0d1";
  ctx.beginPath();
  ctx.arc(x, top + 78, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 6, top + 92, 12, 28);
  if (team === "player") {
    ctx.fillStyle = "#61b9ff";
    ctx.fillRect(x + 18, top + 52, 30, 10);
    ctx.fillRect(x + 42, top + 48, 10, 18);
  }

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(left + 12, top - 20, width - 24, 10);
  ctx.fillStyle = team === "player" ? "#4ac779" : "#ff7e6a";
  ctx.fillRect(left + 12, top - 20, (width - 24) * hpRatio, 10);
}

function getFishSprite(unit) {
  const cacheKey = `${unit.type}-${unit.color}-${unit.accent}`;
  if (fishImageCache.has(cacheKey)) {
    return fishImageCache.get(cacheKey);
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 120">
      <defs>
        <linearGradient id="body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${unit.color}"/>
          <stop offset="100%" stop-color="${unit.accent}"/>
        </linearGradient>
        <linearGradient id="fin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${unit.accent}"/>
          <stop offset="100%" stop-color="${unit.outline}"/>
        </linearGradient>
      </defs>
      <ellipse cx="112" cy="104" rx="58" ry="10" fill="rgba(0,0,0,0.12)"/>
      <path d="M36 61 C16 36, 16 18, 46 16 C58 8, 76 6, 95 10 C136 3, 181 20, 194 47 C206 72, 177 99, 130 102 C95 113, 56 104, 42 90 C18 90, 16 76, 36 61Z" fill="url(#body)" stroke="${unit.outline}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M28 60 L6 35 L14 60 L6 86 Z" fill="url(#fin)" stroke="${unit.outline}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M94 20 L112 2 L124 26 Z" fill="url(#fin)" stroke="${unit.outline}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M86 92 L104 114 L118 90 Z" fill="url(#fin)" stroke="${unit.outline}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M138 34 C158 30, 176 40, 182 54 C171 50, 158 51, 143 58 Z" fill="#ffffff" fill-opacity="0.28"/>
      <circle cx="162" cy="52" r="9" fill="#ffffff"/>
      <circle cx="165" cy="52" r="4.6" fill="${unit.outline}"/>
      <path d="M175 61 Q186 65 194 59" stroke="${unit.outline}" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M96 28 Q125 46 98 72" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="3"/>
      <path d="M68 34 Q94 52 68 82" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="3"/>
      <path d="M46 42 Q70 56 48 76" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="3"/>
    </svg>
  `;

  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  fishImageCache.set(cacheKey, image);
  return image;
}

function drawFallbackFish(unit) {
  ctx.scale(unit.dir, 1);
  ctx.strokeStyle = unit.outline;
  ctx.lineWidth = 3.5;
  ctx.fillStyle = "rgba(43, 26, 18, 0.12)";
  ctx.beginPath();
  ctx.ellipse(0, unit.size * 0.56, unit.size * 0.96, unit.size * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = unit.color;
  ctx.beginPath();
  ctx.moveTo(-unit.size * 0.84, -unit.size * 0.1);
  ctx.quadraticCurveTo(-unit.size * 0.5, -unit.size * 0.9, unit.size * 0.1, -unit.size * 0.7);
  ctx.quadraticCurveTo(unit.size * 0.8, -unit.size * 0.48, unit.size * 0.92, -unit.size * 0.04);
  ctx.quadraticCurveTo(unit.size * 0.82, unit.size * 0.36, unit.size * 0.1, unit.size * 0.42);
  ctx.quadraticCurveTo(-unit.size * 0.54, unit.size * 0.42, -unit.size * 0.84, -unit.size * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-unit.size * 0.88, -unit.size * 0.02);
  ctx.lineTo(-unit.size * 1.2, -unit.size * 0.34);
  ctx.lineTo(-unit.size * 1.08, -unit.size * 0.02);
  ctx.lineTo(-unit.size * 1.2, unit.size * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.beginPath();
  ctx.ellipse(unit.size * 0.18, -unit.size * 0.26, unit.size * 0.24, unit.size * 0.11, -0.18, 0, Math.PI * 2);
  ctx.fill();
}

function drawUnit(unit) {
  if (unit.team === "enemy") {
    drawEnemyObject(unit);
    return;
  }

  const bounce = Math.sin(unit.bob) * 3;
  const y = unit.y + bounce;
  ctx.save();
  ctx.translate(unit.x, y);

  const sprite = getFishSprite(unit);
  if (sprite.complete) {
    ctx.save();
    ctx.scale(unit.dir, 1);
    ctx.fillStyle = "rgba(43, 26, 18, 0.12)";
    ctx.beginPath();
    ctx.ellipse(0, unit.size * 0.56, unit.size * 0.96, unit.size * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.drawImage(sprite, -unit.size * 1.28, -unit.size * 1.02, unit.size * 2.56, unit.size * 1.62);
    ctx.restore();
  } else {
    drawFallbackFish(unit);
  }

  ctx.fillStyle = unit.accent;
  ctx.fillRect(unit.size * 0.12, -unit.size * 0.48, unit.reach, 10);
  ctx.fillStyle = unit.outline;
  ctx.fillRect(unit.size * 0.12 + unit.reach - 10, -unit.size * 0.56, 14, 20);

  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.fillRect(-unit.size * 0.58, unit.size * 0.56, unit.size * 1.16, 7);
  ctx.fillStyle = "#57d17b";
  ctx.fillRect(-unit.size * 0.58, unit.size * 0.56, unit.size * 1.16 * (unit.hp / unit.maxHp), 7);
  ctx.restore();
  drawUnitName(unit, y - unit.size * 1.3);
}

function drawEnemyObject(unit) {
  if (!unit.boss) {
    drawEnemyCat(unit);
    return;
  }

  const bounce = Math.sin(unit.bob) * 2;
  const y = unit.y + bounce;
  ctx.save();
  ctx.translate(unit.x, y);
  ctx.scale(unit.dir, 1);

  ctx.fillStyle = "rgba(20, 18, 18, 0.16)";
  ctx.beginPath();
  ctx.ellipse(0, unit.size * 0.42, unit.size * 0.76, unit.size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = unit.outline;
  ctx.lineWidth = 4;

  if (unit.boss && unit.type === "titanHuman") {
    ctx.fillStyle = unit.color;
    roundedRectPath(-unit.size * 0.32, -unit.size * 1.02, unit.size * 0.64, unit.size * 1.02, 18);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -unit.size * 1.3, unit.size * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#232833";
    ctx.fillRect(-unit.size * 0.18, -unit.size * 1.42, unit.size * 0.36, unit.size * 0.14);
    ctx.strokeRect(-unit.size * 0.18, -unit.size * 1.42, unit.size * 0.36, unit.size * 0.14);
    ctx.fillStyle = unit.accent;
    ctx.beginPath();
    ctx.arc(-unit.size * 0.08, -unit.size * 1.32, unit.size * 0.035, 0, Math.PI * 2);
    ctx.arc(unit.size * 0.08, -unit.size * 1.32, unit.size * 0.035, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#646b76";
    roundedRectPath(-unit.size * 0.5, -unit.size * 0.86, unit.size * 0.18, unit.size * 0.58, 10);
    ctx.fill();
    ctx.stroke();
    roundedRectPath(unit.size * 0.32, -unit.size * 0.86, unit.size * 0.18, unit.size * 0.58, 10);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-unit.size * 0.42, -unit.size * 0.3);
    ctx.lineTo(-unit.size * 0.74, unit.size * 0.12);
    ctx.lineTo(-unit.size * 0.62, unit.size * 0.2);
    ctx.lineTo(-unit.size * 0.28, -unit.size * 0.14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(unit.size * 0.42, -unit.size * 0.3);
    ctx.lineTo(unit.size * 0.74, unit.size * 0.12);
    ctx.lineTo(unit.size * 0.62, unit.size * 0.2);
    ctx.lineTo(unit.size * 0.28, -unit.size * 0.14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-unit.size * 0.18, 0);
    ctx.lineTo(-unit.size * 0.34, unit.size * 0.74);
    ctx.lineTo(-unit.size * 0.12, unit.size * 0.74);
    ctx.lineTo(0, unit.size * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(unit.size * 0.18, 0);
    ctx.lineTo(unit.size * 0.34, unit.size * 0.74);
    ctx.lineTo(unit.size * 0.12, unit.size * 0.74);
    ctx.lineTo(0, unit.size * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = unit.accent;
    ctx.fillRect(-unit.size * 0.14, -unit.size * 0.7, unit.size * 0.28, unit.size * 0.08);
    ctx.fillRect(-unit.size * 0.08, -unit.size * 0.18, unit.size * 0.16, unit.size * 0.08);
  } else if (unit.boss && unit.type === "fridgeBoss") {
    ctx.fillStyle = unit.color;
    roundedRectPath(-unit.size * 0.52, -unit.size * 1.18, unit.size * 1.04, unit.size * 1.3, 12);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -unit.size * 1.12);
    ctx.lineTo(0, unit.size * 0.06);
    ctx.stroke();
    ctx.fillStyle = unit.accent;
    ctx.fillRect(unit.size * 0.22, -unit.size * 0.84, unit.size * 0.08, unit.size * 0.26);
    ctx.fillRect(unit.size * 0.22, -unit.size * 0.26, unit.size * 0.08, unit.size * 0.26);
  } else if (unit.boss && unit.type === "washerBoss") {
    ctx.fillStyle = unit.color;
    roundedRectPath(-unit.size * 0.58, -unit.size * 1.08, unit.size * 1.16, unit.size * 1.2, 16);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#263445";
    ctx.beginPath();
    ctx.arc(0, -unit.size * 0.48, unit.size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = unit.accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, -unit.size * 0.48, unit.size * 0.18, 0, Math.PI * 2);
    ctx.stroke();
  } else if (unit.boss && unit.type === "microwaveBoss") {
    ctx.fillStyle = unit.color;
    roundedRectPath(-unit.size * 0.62, -unit.size * 1.02, unit.size * 1.24, unit.size * 1.08, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1a1a1f";
    ctx.fillRect(-unit.size * 0.42, -unit.size * 0.82, unit.size * 0.54, unit.size * 0.44);
    ctx.strokeRect(-unit.size * 0.42, -unit.size * 0.82, unit.size * 0.54, unit.size * 0.44);
    ctx.fillStyle = unit.accent;
    ctx.beginPath();
    ctx.arc(unit.size * 0.3, -unit.size * 0.76, unit.size * 0.06, 0, Math.PI * 2);
    ctx.arc(unit.size * 0.3, -unit.size * 0.58, unit.size * 0.06, 0, Math.PI * 2);
    ctx.arc(unit.size * 0.3, -unit.size * 0.4, unit.size * 0.06, 0, Math.PI * 2);
    ctx.fill();
  } else if (unit.type === "box") {
    ctx.fillStyle = unit.color;
    roundedRectPath(-unit.size * 0.58, -unit.size * 1.1, unit.size * 1.16, unit.size * 1.16, 10);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#d9b08b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-unit.size * 0.46, -unit.size * 0.74);
    ctx.lineTo(unit.size * 0.46, -unit.size * 0.3);
    ctx.moveTo(-unit.size * 0.46, -unit.size * 0.3);
    ctx.lineTo(unit.size * 0.46, -unit.size * 0.74);
    ctx.stroke();
  } else if (unit.type === "kettle") {
    ctx.fillStyle = unit.color;
    ctx.beginPath();
    ctx.arc(0, -unit.size * 0.54, unit.size * 0.5, Math.PI, 0);
    ctx.lineTo(unit.size * 0.42, 0);
    ctx.lineTo(-unit.size * 0.42, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(unit.size * 0.42, -unit.size * 0.54, unit.size * 0.18, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-unit.size * 0.18, -unit.size * 1.02);
    ctx.lineTo(unit.size * 0.12, -unit.size * 1.18);
    ctx.lineTo(unit.size * 0.18, -unit.size * 0.94);
    ctx.closePath();
    ctx.fillStyle = unit.accent;
    ctx.fill();
    ctx.stroke();
  } else if (unit.type === "lamp") {
    ctx.fillStyle = unit.color;
    ctx.fillRect(-unit.size * 0.18, -unit.size * 1.08, unit.size * 0.36, unit.size * 0.92);
    ctx.strokeRect(-unit.size * 0.18, -unit.size * 1.08, unit.size * 0.36, unit.size * 0.92);
    ctx.beginPath();
    ctx.moveTo(-unit.size * 0.42, -unit.size * 1.08);
    ctx.lineTo(0, -unit.size * 1.44);
    ctx.lineTo(unit.size * 0.42, -unit.size * 1.08);
    ctx.closePath();
    ctx.fillStyle = unit.accent;
    ctx.fill();
    ctx.stroke();
  } else if (unit.type === "fan") {
    ctx.fillStyle = unit.color;
    ctx.beginPath();
    ctx.arc(0, -unit.size * 0.54, unit.size * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    for (let blade = 0; blade < 4; blade += 1) {
      ctx.save();
      ctx.rotate((Math.PI / 2) * blade + unit.bob * 0.16);
      ctx.beginPath();
      ctx.ellipse(unit.size * 0.18, -unit.size * 0.54, unit.size * 0.26, unit.size * 0.1, 0.4, 0, Math.PI * 2);
      ctx.fillStyle = unit.accent;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = unit.color;
    ctx.fillRect(-unit.size * 0.08, -unit.size * 0.18, unit.size * 0.16, unit.size * 0.4);
  } else if (unit.type === "vacuum") {
    ctx.fillStyle = unit.color;
    roundedRectPath(-unit.size * 0.56, -unit.size * 0.94, unit.size * 0.9, unit.size * 0.94, 12);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(unit.size * 0.08, -unit.size * 0.34, unit.size * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = "#2f2f2f";
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(unit.size * 0.22, -unit.size * 0.82);
    ctx.lineTo(unit.size * 0.64, -unit.size * 1.08);
    ctx.lineTo(unit.size * 0.7, -unit.size * 0.98);
    ctx.lineTo(unit.size * 0.34, -unit.size * 0.72);
    ctx.closePath();
    ctx.fillStyle = unit.accent;
    ctx.fill();
    ctx.stroke();
  } else if (unit.type === "toaster") {
    ctx.fillStyle = unit.color;
    roundedRectPath(-unit.size * 0.48, -unit.size * 0.96, unit.size * 0.96, unit.size * 0.9, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = unit.accent;
    ctx.fillRect(-unit.size * 0.2, -unit.size * 1.16, unit.size * 0.18, unit.size * 0.22);
    ctx.fillRect(unit.size * 0.02, -unit.size * 1.16, unit.size * 0.18, unit.size * 0.22);
    ctx.strokeRect(-unit.size * 0.2, -unit.size * 1.16, unit.size * 0.18, unit.size * 0.22);
    ctx.strokeRect(unit.size * 0.02, -unit.size * 1.16, unit.size * 0.18, unit.size * 0.22);
  } else if (unit.type === "clock") {
    ctx.fillStyle = unit.color;
    ctx.beginPath();
    ctx.arc(0, -unit.size * 0.58, unit.size * 0.48, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -unit.size * 0.58);
    ctx.lineTo(0, -unit.size * 0.84);
    ctx.moveTo(0, -unit.size * 0.58);
    ctx.lineTo(unit.size * 0.18, -unit.size * 0.44);
    ctx.stroke();
  } else {
    ctx.fillStyle = unit.color;
    roundedRectPath(-unit.size * 0.6, -unit.size * 1.08, unit.size * 1.2, unit.size * 1.08, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(0, -unit.size * 0.54, unit.size * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = unit.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-unit.size * 0.58, -unit.size * 0.7);
    ctx.lineTo(-unit.size * 0.18, -unit.size * 0.7);
    ctx.moveTo(-unit.size * 0.58, -unit.size * 0.42);
    ctx.lineTo(-unit.size * 0.18, -unit.size * 0.42);
    ctx.moveTo(unit.size * 0.18, -unit.size * 0.7);
    ctx.lineTo(unit.size * 0.58, -unit.size * 0.7);
    ctx.moveTo(unit.size * 0.18, -unit.size * 0.42);
    ctx.lineTo(unit.size * 0.58, -unit.size * 0.42);
    ctx.stroke();
  }

  ctx.strokeStyle = unit.outline;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-unit.size * 0.38, 0);
  ctx.lineTo(-unit.size * 0.18, unit.size * 0.28);
  ctx.moveTo(unit.size * 0.38, 0);
  ctx.lineTo(unit.size * 0.18, unit.size * 0.28);
  ctx.stroke();

  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.fillRect(-unit.size * 0.58, unit.size * 0.2, unit.size * 1.16, 7);
  ctx.fillStyle = unit.boss ? "#ff4f7a" : "#ff8a6e";
  ctx.fillRect(-unit.size * 0.58, unit.size * 0.2, unit.size * 1.16 * (unit.hp / unit.maxHp), 7);
  ctx.restore();
  drawUnitName(unit, y - unit.size * 1.58);
}

function drawEnemyCat(unit) {
  const bounce = Math.sin(unit.bob) * 2.5;
  const y = unit.y + bounce;
  ctx.save();
  ctx.translate(unit.x, y);
  ctx.scale(unit.dir, 1);
  ctx.strokeStyle = unit.outline;
  ctx.lineWidth = 3.5;

  ctx.fillStyle = "rgba(20, 18, 18, 0.16)";
  ctx.beginPath();
  ctx.ellipse(0, unit.size * 0.5, unit.size * 0.82, unit.size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = unit.color;
  roundedRectPath(-unit.size * 0.5, -unit.size * 0.84, unit.size * 0.92, unit.size * 0.5, 18);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(unit.size * 0.24, -unit.size * 0.82, unit.size * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(unit.size * 0.08, -unit.size * 0.98);
  ctx.lineTo(unit.size * 0.16, -unit.size * 1.22);
  ctx.lineTo(unit.size * 0.3, -unit.size * 1.02);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(unit.size * 0.42, -unit.size * 0.98);
  ctx.lineTo(unit.size * 0.34, -unit.size * 1.22);
  ctx.lineTo(unit.size * 0.22, -unit.size * 1.02);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#fff8f5";
  ctx.beginPath();
  ctx.arc(unit.size * 0.18, -unit.size * 0.84, unit.size * 0.05, 0, Math.PI * 2);
  ctx.arc(unit.size * 0.34, -unit.size * 0.84, unit.size * 0.05, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = unit.outline;
  ctx.beginPath();
  ctx.arc(unit.size * 0.18, -unit.size * 0.84, unit.size * 0.022, 0, Math.PI * 2);
  ctx.arc(unit.size * 0.34, -unit.size * 0.84, unit.size * 0.022, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(unit.size * 0.26, -unit.size * 0.74);
  ctx.lineTo(unit.size * 0.26, -unit.size * 0.68);
  ctx.moveTo(unit.size * 0.18, -unit.size * 0.72);
  ctx.quadraticCurveTo(unit.size * 0.26, -unit.size * 0.64, unit.size * 0.34, -unit.size * 0.72);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-unit.size * 0.3, -unit.size * 0.72);
  ctx.quadraticCurveTo(-unit.size * 0.7, -unit.size * 1.02, -unit.size * 0.58, -unit.size * 0.42);
  ctx.stroke();

  for (const legX of [-0.2, -0.02, 0.14, 0.3]) {
    ctx.beginPath();
    ctx.moveTo(unit.size * legX, -unit.size * 0.38);
    ctx.lineTo(unit.size * legX, unit.size * 0.18);
    ctx.stroke();
  }

  ctx.fillStyle = unit.accent;
  ctx.fillRect(unit.size * 0.42, -unit.size * 0.66, unit.reach, 8);
  ctx.fillStyle = unit.outline;
  ctx.fillRect(unit.size * 0.42 + unit.reach - 10, -unit.size * 0.72, 12, 16);

  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.fillRect(-unit.size * 0.56, unit.size * 0.24, unit.size * 1.12, 7);
  ctx.fillStyle = "#ff7e6a";
  ctx.fillRect(-unit.size * 0.56, unit.size * 0.24, unit.size * 1.12 * (unit.hp / unit.maxHp), 7);
  ctx.restore();
  drawUnitName(unit, y - unit.size * 1.5);
}

function drawProjectile(projectile) {
  if (projectile.beam) {
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.strokeStyle = projectile.color;
    ctx.lineWidth = projectile.width;
    ctx.beginPath();
    ctx.moveTo(projectile.x - projectile.dir * 46, projectile.y);
    ctx.lineTo(projectile.x + projectile.dir * 54, projectile.y);
    ctx.stroke();
    ctx.strokeStyle = "rgba(214, 250, 255, 0.9)";
    ctx.lineWidth = Math.max(4, projectile.width * 0.42);
    ctx.beginPath();
    ctx.moveTo(projectile.x - projectile.dir * 38, projectile.y);
    ctx.lineTo(projectile.x + projectile.dir * 46, projectile.y);
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.fillStyle = projectile.color;
  ctx.beginPath();
  ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawBaseLaserBeams() {
  for (const beam of baseLaserBeams) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, beam.life * 1.8);
    ctx.strokeStyle = beam.color;
    ctx.lineWidth = beam.width;
    ctx.beginPath();
    ctx.moveTo(beam.fromX, beam.fromY);
    ctx.lineTo(beam.toX, beam.toY);
    ctx.stroke();
    ctx.strokeStyle = "rgba(120, 226, 255, 0.55)";
    ctx.lineWidth = beam.width + 18;
    ctx.beginPath();
    ctx.moveTo(beam.fromX, beam.fromY);
    ctx.lineTo(beam.toX, beam.toY);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = Math.max(2, beam.width * 0.28);
    ctx.beginPath();
    ctx.moveTo(beam.fromX, beam.fromY);
    ctx.lineTo(beam.toX, beam.toY);
    ctx.stroke();
    ctx.restore();
  }
}

function drawDust() {
  for (const puff of state.dust) {
    ctx.globalAlpha = Math.max(0, puff.life * 2.3);
    ctx.fillStyle = puff.color;
    ctx.beginPath();
    ctx.arc(puff.x, puff.y, puff.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawBackground() {
  const theme = LEVELS[state.selectedLevelKey].theme;
  const sky = ctx.createLinearGradient(0, 0, 0, WORLD.height);
  sky.addColorStop(0, theme.skyTop);
  sky.addColorStop(0.4, theme.skyMid);
  sky.addColorStop(0.68, theme.skyBottom);
  sky.addColorStop(1, theme.groundBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  const sun = ctx.createRadialGradient(theme.sunX, theme.sunY, 10, theme.sunX, theme.sunY, 120);
  sun.addColorStop(0, theme.accent);
  sun.addColorStop(1, "rgba(255, 250, 220, 0)");
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(theme.sunX, theme.sunY, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.ellipse(110 + i * 240, 118 + (i % 2) * 30, 78, 26, 0, 0, Math.PI * 2);
    ctx.ellipse(160 + i * 240, 126 + (i % 2) * 30, 52, 20, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = theme.mountain;
  ctx.beginPath();
  ctx.moveTo(0, 350);
  ctx.lineTo(120, 280);
  ctx.lineTo(220, 336);
  ctx.lineTo(360, 250);
  ctx.lineTo(500, 342);
  ctx.lineTo(640, 268);
  ctx.lineTo(790, 348);
  ctx.lineTo(930, 274);
  ctx.lineTo(1080, 336);
  ctx.lineTo(1280, 250);
  ctx.lineTo(1280, 430);
  ctx.lineTo(0, 430);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = theme.skyline;
  for (let i = 0; i < 11; i += 1) {
    const x = 18 + i * 118;
    const w = 44 + (i % 3) * 18;
    const h = 84 + (i % 4) * 28;
    ctx.fillRect(x, 360 - h, w, h);
    ctx.fillRect(x + w * 0.2, 360 - h - 22, 12, 22);
  }

  ctx.fillStyle = theme.groundBottom;
  ctx.fillRect(0, WORLD.laneY - 8, WORLD.width, WORLD.height - WORLD.laneY + 8);
  ctx.fillStyle = theme.groundTop;
  ctx.fillRect(0, WORLD.laneY - 18, WORLD.width, 16);
  ctx.fillStyle = theme.groundTop;
  ctx.fillRect(0, WORLD.laneY - 62, WORLD.width, 44);
  ctx.fillStyle = "#8a5433";
  ctx.fillRect(0, WORLD.laneY + 72, WORLD.width, 8);
  ctx.strokeStyle = "rgba(104, 55, 25, 0.18)";
  ctx.lineWidth = 4;
  for (let i = 0; i < 12; i += 1) {
    const x = i * 118 + 24;
    ctx.beginPath();
    ctx.moveTo(x, WORLD.laneY - 18);
    ctx.lineTo(x + 34, WORLD.laneY + 72);
    ctx.stroke();
  }
}

function render() {
  drawBackground();
  drawBase(WORLD.playerBaseX, "player", state.playerBase.hp / state.playerBase.maxHp);
  drawBase(WORLD.enemyBaseX, "enemy", state.enemyBase.hp / state.enemyBase.maxHp);
  drawBaseLaserBeams();

  const allUnits = [...state.units, ...state.enemyUnits].sort((a, b) => a.y - b.y || a.x - b.x);
  for (const unit of allUnits) {
    drawUnit(unit);
  }
  for (const projectile of state.projectiles) {
    drawProjectile(projectile);
  }
  drawDust();

  ctx.fillStyle = "#2b1b16";
  ctx.font = '24px "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
  ctx.fillText(`Wave ${state.enemyWave}`, WORLD.width / 2 - 44, 54);
  if (state.bossesSpawned > 0) {
    ctx.fillStyle = "#8e1737";
    ctx.font = '18px "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
    ctx.fillText(`Boss ${state.bossesSpawned}`, WORLD.width / 2 - 32, 82);
  }
  if (!state.finalBossSpawned) {
    ctx.fillStyle = "#4b2330";
    ctx.font = '16px "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
    ctx.fillText(`Final Boss in ${Math.max(0, Math.ceil(state.finalBossTimer))}s`, WORLD.width / 2 - 62, 108);
  } else {
    ctx.fillStyle = "#b3122f";
    ctx.font = '18px "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
    ctx.fillText("Final Boss: titan human", WORLD.width / 2 - 88, 108);
  }
}

function loop(timestamp) {
  const dt = Math.min(0.033, (timestamp - lastTs) / 1000 || 0.016);
  lastTs = timestamp;
  update(dt);
  render();
  rafId = requestAnimationFrame(loop);
}

function roundRect(x, y, width, height, radius) {
  roundedRectPath(x, y, width, height, radius);
}

function roundedRectPath(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function handleKey(event) {
  const key = event.key.toLowerCase();
  const availableUnits = getAvailableUnitOrder();
  const bindingIndex = KEY_BINDINGS.indexOf(key);
  if (bindingIndex !== -1 && availableUnits[bindingIndex]) {
    spawnPlayerUnit(availableUnits[bindingIndex]);
  } else if (key === "q") {
    upgradeIncome();
  } else if (key === "e") {
    fireBaseLaser();
  } else if (key === "m") {
    toggleMusic();
  } else if (key === "r") {
    startGame();
  } else if (key === "f") {
    toggleFullscreen();
  }
}

function fireBaseLaser() {
  if (state.mode !== "playing") {
    return;
  }
  if (state.baseLaserCooldown > 0) {
    state.message = "베이스 레이저 충전 중입니다.";
    syncHud();
    return;
  }

  const targets = [...state.enemyUnits];
  const originX = WORLD.playerBaseX + 48;
  const originY = WORLD.laneY - 84;
  const beamY = WORLD.laneY - 78;
  baseLaserBeams.push({
    fromX: originX,
    fromY: originY,
    toX: WORLD.enemyBaseX - 14,
    toY: beamY,
    width: 30,
    life: 0.95,
    color: "#41c8ff",
  });

  if (targets.length === 0) {
    state.enemyBase.hp -= 120;
  } else {
    for (const target of targets) {
      target.hp -= target.boss ? 180 : 120;
      state.dust.push({
        x: target.x,
        y: target.y - target.size * 0.5,
        life: 0.38,
        radius: target.boss ? 42 : 26,
        color: "#88ebff",
      });
    }
    state.enemyBase.hp -= 40;
  }

  state.baseLaserCooldown = 16;
  state.message = "베이스 레이저 발사!";
  syncHud();
}

async function toggleFullscreen() {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    await canvas.requestFullscreen();
  }
}

renderUnitButtons();
renderUnlockRoster();
ui.saveButtons.forEach((button) => {
  button.addEventListener("click", () => selectSaveSlot(button.dataset.save));
});
ui.levelButtons.forEach((button) => {
  button.addEventListener("click", () => selectLevel(button.dataset.level));
});
ui.startBtn.addEventListener("click", startGame);
ui.homeBtn.addEventListener("click", returnToLaunch);
ui.launchStartBtn.addEventListener("click", startGame);
ui.gachaBtn.addEventListener("click", performGacha);
if (ui.codeBtn) {
  ui.codeBtn.addEventListener("click", redeemCode);
}
if (ui.codeInput) {
  ui.codeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      redeemCode();
    }
  });
}
ui.upgradeBtn.addEventListener("click", upgradeIncome);
ui.baseLaserBtn.addEventListener("click", fireBaseLaser);
window.addEventListener("keydown", handleKey);
document.addEventListener("fullscreenchange", render);
document.addEventListener("pointerdown", ensureMusic, { once: true });

if (ui.codeResult) {
  ui.codeResult.textContent = `사용 가능한 코드 수: ${Object.keys(REDEEM_CODES).length}개`;
}

window.render_game_to_text = () =>
  JSON.stringify({
    mode: state.mode,
    coordinateSystem: "origin top-left, x rightward, y downward",
    resources: {
      cost: Math.floor(state.cost),
      maxCost: state.maxCost,
      incomePerSecond: state.income,
      incomeLevel: state.incomeLevel,
      upgradeCost: state.incomeUpgradeCost,
    },
    bases: {
      player: { hp: Math.ceil(state.playerBase.hp), x: WORLD.playerBaseX },
      enemy: { hp: Math.ceil(state.enemyBase.hp), x: WORLD.enemyBaseX },
    },
    playerUnits: state.units.map((unit) => ({
      type: unit.type,
      hp: Math.ceil(unit.hp),
      x: Math.round(unit.x),
      attackCooldown: Number(unit.attackTimer.toFixed(2)),
    })),
    enemyUnits: state.enemyUnits.map((unit) => ({
      type: unit.type,
      hp: Math.ceil(unit.hp),
      x: Math.round(unit.x),
      attackCooldown: Number(unit.attackTimer.toFixed(2)),
    })),
    projectiles: state.projectiles.map((projectile) => ({
      x: Math.round(projectile.x),
      dir: projectile.dir,
      team: projectile.team,
    })),
    message: state.message,
  });

window.advanceTime = (ms) => {
  const steps = Math.max(1, Math.round(ms / (1000 / 60)));
  for (let index = 0; index < steps; index += 1) {
    update(1 / 60);
  }
  render();
};

resetState();
cancelAnimationFrame(rafId);
rafId = requestAnimationFrame(loop);
