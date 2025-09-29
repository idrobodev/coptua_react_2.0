import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export const ParticipantsBySedeChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.sede),
    datasets: [
      {
        label: 'Participantes Activos',
        data: data.map(item => item.activos),
        backgroundColor: [
          'rgba(103, 108, 184, 0.8)',
          'rgba(54, 149, 204, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: [
          'rgba(103, 108, 184, 1)',
          'rgba(54, 149, 204, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Poppins',
          },
        },
      },
      title: {
        display: true,
        text: 'Participantes por Sede',
        font: {
          family: 'Lato',
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: 'Poppins',
          },
        },
      },
      x: {
        ticks: {
          font: {
            family: 'Poppins',
          },
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export const PaymentStatusChart = ({ data }) => {
  const chartData = {
    labels: ['Pagadas', 'Pendientes', 'Vencidas'],
    datasets: [
      {
        data: [data.pagadas, data.pendientes, data.vencidas],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            family: 'Poppins',
          },
        },
      },
      title: {
        display: true,
        text: 'Estado de Mensualidades',
        font: {
          family: 'Lato',
          size: 16,
          weight: 'bold',
        },
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
};

export const MonthlyTrendChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.mes),
    datasets: [
      {
        label: 'Ingresos',
        data: data.map(item => item.ingresos),
        borderColor: 'rgba(103, 108, 184, 1)',
        backgroundColor: 'rgba(103, 108, 184, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Nuevos Participantes',
        data: data.map(item => item.nuevos),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Poppins',
          },
        },
      },
      title: {
        display: true,
        text: 'Tendencias Mensuales',
        font: {
          family: 'Lato',
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: 'Poppins',
          },
        },
      },
      x: {
        ticks: {
          font: {
            family: 'Poppins',
          },
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export const FormStatusChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.tipo),
    datasets: [
      {
        label: 'Pendientes',
        data: data.map(item => item.pendientes),
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
        borderColor: 'rgba(251, 191, 36, 1)',
        borderWidth: 2,
      },
      {
        label: 'Completados',
        data: data.map(item => item.completados),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Poppins',
          },
        },
      },
      title: {
        display: true,
        text: 'Estado de Formularios por Especialidad',
        font: {
          family: 'Lato',
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
        ticks: {
          font: {
            family: 'Poppins',
          },
        },
      },
      x: {
        stacked: true,
        ticks: {
          font: {
            family: 'Poppins',
          },
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};
