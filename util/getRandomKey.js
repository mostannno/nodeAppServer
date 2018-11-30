function getRandom() {
  const arr = new Array(10);
  for (let i = arr.length - 1; i >= 0; i--) {
    arr[i] = mapNumberToCode(Math.floor(Math.random() * 62));
  }
  return arr.join('');
}

function mapNumberToCode(num) {
  if (!num) return 0;
  if (num < 10) return num;
  if (num < 36) return String.fromCharCode(num + 55);
  return String.fromCharCode(num + 61);
}

module.exports = getRandom;