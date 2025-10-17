import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import type { DailySpent, DailySpentData } from '../../types/api';
import dayjs from 'dayjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const prepareCumulativeChartData = (dailyData: DailySpentData[], month: string): number[] => {
  const daysInMonth = dayjs(month).daysInMonth();
  const dailyTotals = Array(daysInMonth).fill(0);

  dailyData.forEach(item => {
    const dayOfMonth = dayjs(item.date).date();
    const index = dayOfMonth - 1;
    if (index >= 0 && index < daysInMonth) {
      dailyTotals[index] = item.amount;
    }
  });

  for (let i = 1; i < daysInMonth; i++) {
    dailyTotals[i] += dailyTotals[i - 1];
  }

  return dailyTotals;
};

interface MonthlyTrendLineChartProps {
  data: DailySpent;
}

export default function MonthlyTrendLineChart({ data }: MonthlyTrendLineChartProps) {
  const currentMonth = dayjs();
  const previousMonth = currentMonth.subtract(1, 'month');

  const labels = Array.from({ length: currentMonth.daysInMonth() }, (_, i) => `${i + 1}일`);

  const chartData = {
    labels,
    datasets: [
      {
        label: '지난달 누적',
        data: prepareCumulativeChartData(data.previousMonth, previousMonth.format('YYYY-MM')),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
        pointRadius: 0,
        pointHitRadius: 10,
      },
      {
        label: '이번 달 누적',
        data: prepareCumulativeChartData(data.currentMonth, currentMonth.format('YYYY-MM')),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.1,
        pointRadius: 0,
        pointHitRadius: 10,
      },
    ],
  };
  
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: '일별 누적 소비 추이 비교' },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 15,
        }
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Line options={options} data={chartData} />
    </div>
  );
}