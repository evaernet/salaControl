// 38.5 -> "38,5 °C"
export function grados(temperatura: number): string {
  return `${temperatura.toFixed(1).replace('.', ',')} °C`;
}
