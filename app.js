const gameData = loadGameData();
const stack = document.querySelector('#stack');
const saveBadge = document.querySelector('#save-badge');

for (let level = 0; level < gameData.stackLevels; level += 1) {
  const row = document.createElement('div');
  row.className = 'level';
  for (let block = 0; block < 3; block += 1) {
    const piece = document.createElement('div');
    piece.className = 'block';
    piece.setAttribute('aria-label', `Wooden block ${block + 1} on level ${level + 1}`);
    row.appendChild(piece);
  }
  stack.appendChild(row);
}

saveBadge.title = `${gameData.sampleItems.length} sample dares saved in your browser`;
