import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { CategorySpent } from '../../types/api';

ChartJS.register(ArcElement, Tooltip, Legend);

// 동적인 색상 생성을 위한 헬퍼 함수
const generateColors = (numColors: number) => {
  const colors = [];
  for (let i = 0; i < numColors; i++) {
    const hue = (i * 360) / numColors;
    colors.push(`hsla(${hue}, 70%, 60%, 0.7)`);
  }
  return colors;
};

interface SpendingPieChartProps {
  data: CategorySpent[];
}

export default function SpendingPieChart({ data }: SpendingPieChartProps) {
  const chartData = {
    labels: data.map(item => item.categoryName),
    datasets: [
      {
        label: '이번 달 소비',
        data: data.map(item => item.totalSpent),
        backgroundColor: generateColors(data.length),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: '이번 달 카테고리별 소비' },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Pie data={chartData} options={options} />
    </div>
  );
}