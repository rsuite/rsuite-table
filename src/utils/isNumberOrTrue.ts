export default function isNumberOrTrue(value: number | boolean): boolean {
  return !!value || value === 0;
}
