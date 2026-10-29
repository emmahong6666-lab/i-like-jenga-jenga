const gameData = loadGameData();
const stage = document.querySelector('.stage');
const stack = document.querySelector('#stack');
const saveBadge = document.querySelector('#save-badge');
const gameStatus = document.querySelector('#game-status');
const blocks = [];
const blockWidth = 74;
const blockHeight = 42;
const blockGap = 8;
const gravity = 980;
const catsToWin = 5;
let activeBlock = null;
let lastFrame = performance.now();
let collapseStarted = false;
let physicsStarted = false;
let removedCats = 0;
let gameOver = false;

function placeBlock(block) {
  block.element.style.left = `${block.x}px`;
  block.element.style.top = `${block.y}px`;
  block.element.style.transform = `rotate(${block.angle}deg)`;
}

function createStack() {
  const stageWidth = stage.clientWidth;
  const stageHeight = stage.clientHeight;
  const towerWidth = 3 * blockWidth + 2 * blockGap;
  const towerLeft = (stageWidth - towerWidth) / 2;
  const floor = stageHeight - 48;

  for (let level = 0; level < gameData.stackLevels; level += 1) {
    for (let index = 0; index < 3; index += 1) {
      const piece = document.createElement('div');
      const x = towerLeft + index * (blockWidth + blockGap) + (level % 2 === 1 ? 4 : 0);
      const y = floor - level * 54 - blockHeight;

      piece.className = 'block';
      piece.setAttribute('aria-label', `Cat ${index + 1} on level ${level + 1}`);
      piece.setAttribute('draggable', 'false');
      stack.appendChild(piece);

      const block = { element: piece, x, y, vx: 0, vy: 0, angle: 0, level, startX: x, startY: y, dragging: false, nudgedOthers: false };
      blocks.push(block);
      placeBlock(block);
      piece.addEventListener('pointerdown', (event) => startDrag(event, block));
    }
  }
}

function pointerPosition(event) {
  const bounds = stage.getBoundingClientRect();
  return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
}

function startDrag(event, block) {
  if (gameOver || block.removed) return;
  event.preventDefault();
  activeBlock = block;
  const pointer = pointerPosition(event);
  block.dragging = true;
  block.dragStartX = block.x;
  block.dragStartLevel = block.level;
  block.pointerOffsetX = pointer.x - block.x;
  block.pointerOffsetY = pointer.y - block.y;
  block.lastPointerX = pointer.x;
  block.lastPointerY = pointer.y;
  block.element.classList.add('dragging');
  block.element.setPointerCapture(event.pointerId);
  block.element.addEventListener('pointermove', dragBlock);
  block.element.addEventListener('pointerup', endDrag, { once: true });
  block.element.addEventListener('pointercancel', endDrag, { once: true });
}

function dragBlock(event) {
  if (!activeBlock) return;
  const pointer = pointerPosition(event);
  activeBlock.x = pointer.x - activeBlock.pointerOffsetX;
  activeBlock.y = pointer.y - activeBlock.pointerOffsetY;
  activeBlock.vx = (pointer.x - activeBlock.lastPointerX) * 8;
  activeBlock.vy = (pointer.y - activeBlock.lastPointerY) * 8;
  activeBlock.lastPointerX = pointer.x;
  activeBlock.lastPointerY = pointer.y;
  nudgeNearby(activeBlock);
  placeBlock(activeBlock);
}

function nudgeNearby(movingBlock) {
  for (const other of blocks) {
    if (other === movingBlock || other.removed || !overlap(movingBlock, other)) continue;
    const direction = other.x >= movingBlock.x ? 1 : -1;
    other.vx += direction * 170;
    other.vy -= 110;
    other.element.classList.add('nudged');
    movingBlock.nudgedOthers = true;
    collapseStarted = true;
    physicsStarted = true;
    gameStatus.textContent = 'You nudged another cat — steady the tower!';
    gameStatus.classList.add('danger');
  }
}

function endDrag() {
  if (!activeBlock) return;
  const block = activeBlock;
  block.dragging = false;
  block.element.classList.remove('dragging');
  block.element.removeEventListener('pointermove', dragBlock);
  const pulledOut = Math.abs(block.x - block.dragStartX) > 55;
  const isMiddleCat = block.level > 0 && block.level < gameData.stackLevels - 1;
  if (pulledOut && isMiddleCat && !block.nudgedOthers) {
    removeCat(block);
  } else if (pulledOut) {
    gameStatus.textContent = 'That cat was supporting the tower — it fell! Reload to try again.';
    gameStatus.classList.add('danger');
    collapseStarted = true;
    physicsStarted = true;
  } else {
    block.x = block.startX;
    block.y = block.startY;
    block.vx = 0;
    block.vy = 0;
    placeBlock(block);
  }
  activeBlock = null;
}

function removeCat(block) {
  block.removed = true;
  block.element.classList.add('removed');
  block.element.setAttribute('aria-hidden', 'true');
  block.element.style.display = 'none';
  removedCats += 1;
  if (removedCats >= catsToWin) {
    gameOver = true;
    gameStatus.textContent = 'You win! The cat tower is still standing. 🐱';
    gameStatus.classList.add('success');
  } else {
    gameStatus.textContent = `${catsToWin - removedCats} middle cats left to remove safely.`;
  }
}

function overlap(first, second) {
  return first.x < second.x + blockWidth && first.x + blockWidth > second.x && first.y < second.y + blockHeight && first.y + blockHeight > second.y;
}

function moveBlocks(delta) {
  const floor = stage.clientHeight - 48;
  for (const block of blocks) {
    if (block.dragging || block.removed) continue;
    block.vy += gravity * delta;
    block.x += block.vx * delta;
    block.y += block.vy * delta;
    block.vx *= 0.995;

    if (block.x < 4 || block.x > stage.clientWidth - blockWidth - 4) {
      block.x = Math.max(4, Math.min(stage.clientWidth - blockWidth - 4, block.x));
      block.vx *= -0.35;
    }
    if (block.y + blockHeight > floor) {
      block.y = floor - blockHeight;
      block.vy *= -0.22;
      block.vx *= 0.86;
    }
  }

  for (let firstIndex = 0; firstIndex < blocks.length; firstIndex += 1) {
    const first = blocks[firstIndex];
    if (first.dragging || first.removed) continue;
    for (let secondIndex = firstIndex + 1; secondIndex < blocks.length; secondIndex += 1) {
      const second = blocks[secondIndex];
      if (second.dragging || second.removed || !overlap(first, second)) continue;
      const upper = first.y <= second.y ? first : second;
      const lower = upper === first ? second : first;
      upper.y = lower.y - blockHeight;
      upper.vy = Math.min(upper.vy, lower.vy * 0.15);
      upper.vx *= 0.97;
    }
  }

  for (const block of blocks) placeBlock(block);
}

function explodeTower() {
  if (!collapseStarted) return;
  collapseStarted = false;
  for (const block of blocks) {
    if (block.removed) continue;
    block.vx += (block.x < stage.clientWidth / 2 ? -1 : 1) * (120 + Math.random() * 180);
    block.vy -= 180 + Math.random() * 220;
    block.element.classList.add('exploding');
  }
  window.setTimeout(() => blocks.forEach((block) => block.element.classList.remove('exploding')), 900);
}

function animate(now) {
  const delta = Math.min((now - lastFrame) / 1000, 0.035);
  lastFrame = now;
  if (physicsStarted) {
    moveBlocks(delta);
    if (!activeBlock && collapseStarted) explodeTower();
  }
  requestAnimationFrame(animate);
}

saveBadge.title = `${gameData.sampleItems.length} sample dares saved in your browser`;
createStack();
requestAnimationFrame(animate);
