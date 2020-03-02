export default function isRTL(): boolean {
  return (
    typeof window !== 'undefined' && (document.body.getAttribute('dir') || document.dir) === 'rtl'
  );
}
