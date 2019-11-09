export default function getRandomKey(index) {
  return `_${(Math.random() * 1e18)
    .toString(36)
    .slice(0, 5)
    .toUpperCase()}_${index}`;
}
