/**
 * 차트에 사용할 다채로운 색상 배열을 생성합니다.
 * @param numColors - 필요한 색상의 수
 */
export const generateColors = (numColors: number): string[] => {
  const colors: string[] = [];
  for (let i = 0; i < numColors; i++) {
    const hue = (i * 137.508) % 360; // 황금각을 이용해 서로 구분되는 색상 생성
    colors.push(`hsl(${hue}, 65%, 55%)`);
  }
  return colors;
};