'use client'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Filler, Tooltip
} from 'chart.js'
import { fmt } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

interface DCAChartProps {
  portfolioValues: number[]
  investedValues: number[]
  labels: string[]
  color: string
}

export function DCAChart({ portfolioValues, investedValues, labels, color }: DCAChartProps) {
  return (
    <div style={{ position: 'relative', height: 280 }}>
      <Line
        data={{
          labels,
          datasets: [
            {
              label: 'Valeur portefeuille',
              data: portfolioValues,
              borderColor: color,
              backgroundColor: color + '18',
              fill: true,
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.3,
            },
            {
              label: 'Total investi',
              data: investedValues,
              borderColor: '#444',
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderDash: [5, 4],
              pointRadius: 0,
              tension: 0.1,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: '#1a1a1a',
              borderColor: '#333',
              borderWidth: 1,
              titleColor: '#888',
              bodyColor: '#f0f0f0',
              padding: 10,
              callbacks: {
                label: c => c.dataset.label + ' : ' + fmt(c.parsed.y, 0) + ' €',
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              border: { display: false },
              ticks: { maxRotation: 0, font: { size: 10 }, color: '#555', maxTicksLimit: 10 },
            },
            y: {
              grid: { color: '#ffffff08' },
              border: { display: false },
              ticks: {
                font: { size: 10 }, color: '#555',
                callback: v => Number(v) >= 1000 ? (Number(v) / 1000).toFixed(0) + 'k €' : v + ' €',
              },
            },
          },
        }}
      />
    </div>
  )
}
