export default function isSupportTouchEvent() {
  return 'ontouchstart' in window;
}
