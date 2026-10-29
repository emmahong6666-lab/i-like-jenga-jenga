const gameData = loadGameData();
const stage = document.querySelector('.stage');
const stack = document.querySelector('#stack');
const saveBadge = document.querySelector('#save-badge');
const blocks = [];
const blockWidth = 85;
const blockHeight = 28;
const blockGap = 4;
const gravity = 980;
let activeBlock = null;
let lastFrame = performance.now();
let collapseStarted = false;
let physicsStarted = false;

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
      const vertical = level % 2 === 1;
      const x = vertical ? towerLeft + index * 31 + 27 : towerLeft + index * (blockWidth + blockGap);
      const y = vertical ? floor - level * 31 - blockHeight - 28 : floor - level * 31 - blockHeight;

      piece.className = 'block';
      piece.setAttribute('aria-label', `Wooden block ${index + 1} on level ${level + 1}`);
      piece.setAttribute('draggable', 'false');
      stack.appendChild(piece);

      const block = { element: piece, x, y, vx: 0, vy: 0, angle: vertical ? 90 : 0, level, startX: x, dragging: false };
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
  event.preventDefault();
  physicsStarted = true;
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
  placeBlock(activeBlock);
}

function endDrag() {
  if (!activeBlock) return;
  const block = activeBlock;
  block.dragging = false;
  block.element.classList.remove('dragging');
  block.element.removeEventListener('pointermove', dragBlock);
  if (block.level < 4 && Math.abs(block.x - block.dragStartX) > 55) collapseStarted = true;
  activeBlock = null;
}

function overlap(first, second) {
  return first.x < second.x + blockWidth && first.x + blockWidth > second.x && first.y < second.y + blockHeight && first.y + blockHeight > second.y;
}

function moveBlocks(delta) {
  const floor = stage.clientHeight - 48;
  for (const block of blocks) {
    if (block.dragging) continue;
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
    if (first.dragging) continue;
    for (let secondIndex = firstIndex + 1; secondIndex < blocks.length; secondIndex += 1) {
      const second = blocks[secondIndex];
      if (second.dragging || !overlap(first, second)) continue;
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
