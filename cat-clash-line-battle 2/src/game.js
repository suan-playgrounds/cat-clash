const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  startBtn: document.getElementById("start-btn"),
  playerBaseText: document.getElementById("player-base-text"),
  enemyBaseText: document.getElementById("enemy-base-text"),
  resourceText: document.getElementById("resource-text"),
  statusText: document.getElementById("status-text"),
  overlay: document.getElementById("overlay"),
  overlayTitle: document.getElementById("overlay-title"),
  overlayMessage: document.getElementById("overlay-message"),
  upgradeBtn: document.getElementById("upgrade-btn"),
  upgradeCostText: document.getElementById("upgrade-cost-text"),
  unitButtons: Array.from(document.querySelectorAll(".unit-btn[data-unit]")),
};

const UNIT_TYPES = {
  tank: {
    key: "tank",
    label: "탱크냥",
    cost: 90,
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
    label: "검사냥",
    cost: 140,
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
    label: "캐논냥",
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
};

const ENEMY_TYPES = [
  {
    name: "Doge",
    hp: 130,
    damage: 20,
    speed: 42,
    attackRange: 34,
    cooldown: 0.95,
    reach: 24,
    size: 30,
    color: "#51454d",
    accent: "#b7ff5f",
  },
  {
    name: "Boar",
    hp: 240,
    damage: 34,
    speed: 30,
    attackRange: 40,
    cooldown: 1.18,
    reach: 30,
    size: 38,
    color: "#714a4b",
    accent: "#ffcb57",
  },
  {
    name: "Owl",
    hp: 110,
    damage: 26,
    speed: 56,
    attackRange: 150,
    cooldown: 1.3,
    reach: 76,
    size: 28,
    color: "#403c5d",
    accent: "#95d9ff",
    projectile: true,
  },
];

const WORLD = {
  width: 1280,
  height: 720,
  laneY: 530,
  laneH: 110,
  playerBaseX: 116,
  enemyBaseX: 1164,
};

const state = createInitialState();
let rafId = 0;
let lastTs = 0;
let nextUnitId = 1;

function createInitialState() {
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
    spawnCooldowns: { tank: 0, sword: 0, cannon: 0 },
    playerBase: { hp: 1200, maxHp: 1200, x: WORLD.playerBaseX, y: WORLD.laneY, size: 86 },
    enemyBase: { hp: 1200, maxHp: 1200, x: WORLD.enemyBaseX, y: WORLD.laneY, size: 86 },
    units: [],
    enemyUnits: [],
    projectiles: [],
    enemySpawnTimer: 3.4,
    enemyWave: 0,
    dust: [],
  };
}

function resetState() {
  const fresh = createInitialState();
  nextUnitId = 1;
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, fresh);
  setOverlay("전투 준비", "버튼이나 숫자키로 유닛을 뽑아 적 기지를 밀어보세요.", true);
  syncHud();
  render();
}

function startGame() {
  resetState();
  state.mode = "playing";
  state.message = "아군 출격! 코스트를 모아 라인을 밀어내세요.";
  setOverlay("", "", false);
  syncHud();
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
  const wavePressure = Math.min(2, Math.floor(state.elapsed / 32));
  const pool = ENEMY_TYPES.slice(0, 2 + wavePressure);
  const type = pool[Math.floor(Math.random() * pool.length)];
  state.enemyUnits.push(createUnit(type, "enemy"));
  state.enemyWave += 1;
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

  state.enemySpawnTimer -= dt;
  if (state.enemySpawnTimer <= 0) {
    spawnEnemy();
    const tension = Math.max(1.25, 3.2 - state.elapsed * 0.018);
    state.enemySpawnTimer = tension + Math.random() * 0.7;
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
      state.projectiles.push({
        x: unit.x + unit.dir * (unit.size * 0.55),
        y: unit.y - unit.size * 0.6,
        dir: unit.dir,
        speed: 250,
        damage: unit.damage,
        rangeLeft: unit.attackRange + 80,
        team: unit.team,
        color: unit.accent,
        radius: 8,
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
    state.message = "승리! 적 기지를 무너뜨렸습니다.";
    setOverlay("승리", "고양이 군단이 적 기지를 파괴했습니다. R을 눌러 다시 시작하세요.", true);
  }
}

function syncHud() {
  ui.playerBaseText.textContent = `${Math.ceil(state.playerBase.hp)} / ${state.playerBase.maxHp}`;
  ui.enemyBaseText.textContent = `${Math.ceil(state.enemyBase.hp)} / ${state.enemyBase.maxHp}`;
  ui.resourceText.textContent = `${Math.floor(state.cost)} / ${state.maxCost} · +${state.income}/s`;
  ui.statusText.textContent = state.message;
  ui.upgradeCostText.textContent = `${state.incomeUpgradeCost}`;

  for (const btn of ui.unitButtons) {
    const type = UNIT_TYPES[btn.dataset.unit];
    const available = state.cost >= type.cost && state.spawnCooldowns[type.key] <= 0 && state.mode === "playing";
    btn.classList.toggle("disabled", !available);
  }

  const canUpgrade = state.cost >= state.incomeUpgradeCost && state.mode === "playing";
  ui.upgradeBtn.classList.toggle("disabled", !canUpgrade);
}

function setOverlay(title, message, visible) {
  ui.overlayTitle.textContent = title;
  ui.overlayMessage.textContent = message;
  ui.overlay.classList.toggle("visible", visible);
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

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(left + 12, top - 20, width - 24, 10);
  ctx.fillStyle = team === "player" ? "#4ac779" : "#ff7e6a";
  ctx.fillRect(left + 12, top - 20, (width - 24) * hpRatio, 10);
}

function drawUnit(unit) {
  const bounce = Math.sin(unit.bob) * 3;
  const y = unit.y + bounce;
  const facing = unit.dir;
  ctx.save();
  ctx.translate(unit.x, y);
  ctx.scale(facing, 1);

  ctx.fillStyle = unit.color;
  ctx.strokeStyle = unit.outline;
  ctx.lineWidth = 4;
  ctx.beginPath();
  roundedRectPath(-unit.size * 0.55, -unit.size * 1.15, unit.size * 1.1, unit.size * 0.95, 16);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, -unit.size * 1.18, unit.size * 0.46, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = unit.outline;
  ctx.beginPath();
  ctx.arc(-8, -unit.size * 1.2, 4, 0, Math.PI * 2);
  ctx.arc(8, -unit.size * 1.2, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = unit.accent;
  ctx.fillRect(unit.size * 0.06, -unit.size * 0.86, unit.reach, 10);
  ctx.fillStyle = unit.outline;
  ctx.fillRect(unit.size * 0.06 + unit.reach - 10, -unit.size * 0.92, 14, 20);

  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.fillRect(-unit.size * 0.58, unit.size * 0.12, unit.size * 1.16, 7);
  ctx.fillStyle = "#57d17b";
  ctx.fillRect(-unit.size * 0.58, unit.size * 0.12, unit.size * 1.16 * (unit.hp / unit.maxHp), 7);
  ctx.restore();
}

function drawProjectile(projectile) {
  ctx.fillStyle = projectile.color;
  ctx.beginPath();
  ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
  ctx.fill();
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
  const sky = ctx.createLinearGradient(0, 0, 0, WORLD.height);
  sky.addColorStop(0, "#9dd9ff");
  sky.addColorStop(0.55, "#f7dfa8");
  sky.addColorStop(1, "#d37a34");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.ellipse(140 + i * 280, 120 + (i % 2) * 36, 74, 28, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#c99461";
  ctx.fillRect(0, WORLD.laneY - 8, WORLD.width, WORLD.height - WORLD.laneY + 8);
  ctx.fillStyle = "#f1bf7f";
  ctx.fillRect(0, WORLD.laneY - 18, WORLD.width, 16);
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
  if (key === "1") {
    spawnPlayerUnit("tank");
  } else if (key === "2") {
    spawnPlayerUnit("sword");
  } else if (key === "3") {
    spawnPlayerUnit("cannon");
  } else if (key === "q") {
    upgradeIncome();
  } else if (key === "r") {
    startGame();
  } else if (key === "f") {
    toggleFullscreen();
  }
}

async function toggleFullscreen() {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    await canvas.requestFullscreen();
  }
}

ui.startBtn.addEventListener("click", startGame);
ui.upgradeBtn.addEventListener("click", upgradeIncome);
ui.unitButtons.forEach((button) => {
  button.addEventListener("click", () => spawnPlayerUnit(button.dataset.unit));
});
window.addEventListener("keydown", handleKey);
document.addEventListener("fullscreenchange", render);

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
