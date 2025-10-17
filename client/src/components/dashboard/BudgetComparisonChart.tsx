import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import type { BudgetReportCategory } from '../../types/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BudgetComparisonChartProps {
  data: BudgetReportCategory[];
}

export default function BudgetComparisonChart({ data }: BudgetComparisonChartProps) {
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: '카테고리별 예산 대비 지출 현황' },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const labels = data.map(item => item.categoryName);

  const chartData = {
    labels,
    datasets: [
      {
        label: '예산',
        data: data.map(item => item.totalBudget),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
      {
        label: '지출',
        data: data.map(item => item.totalSpent),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      },
    ],
  };

  return <Bar options={options} data={chartData} />;
}