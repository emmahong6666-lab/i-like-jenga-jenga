// Keep browser saving in this one small file so it can be replaced by a database later.
const JENGA_STORAGE_KEY = 'i-like-jenga-jenga';

const sampleItems = [
  'Do your silliest dance for 10 seconds.',
  'Talk like a robot until your next turn.',
  'Give the person on your left a dramatic compliment.'
];

function loadGameData() {
  const saved = localStorage.getItem(JENGA_STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  const firstVisit = { sampleItems, stackLevels: 6, lastOpenedAt: new Date().toISOString() };
  saveGameData(firstVisit);
  return firstVisit;
}

function saveGameData(data) {
  localStorage.setItem(JENGA_STORAGE_KEY, JSON.stringify(data));
}
