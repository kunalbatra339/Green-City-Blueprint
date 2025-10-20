import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './ChartComponent.css';

// We must register the components we're using
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function ChartComponent({ locationId }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!locationId) {
      setChartData(null); // Clear chart if no location is selected
      return;
    }

    // Fetch historical data for the selected location
    fetch(`http://localhost:5000/api/data/air_quality/${locationId}`)
      .then(res => res.json())
      .then(data => {
        // Format the data for Chart.js
        const labels = data.map(item => new Date(item.timestamp).toLocaleDateString());
        const aqiValues = data.map(item => item.aqi);

        setChartData({
          labels: labels,
          datasets: [
            {
              label: `AQI for ${locationId}`,
              data: aqiValues,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
            },
          ],
        });
      })
      .catch(error => console.error('Error fetching historical data:', error));

  }, [locationId]); // This effect re-runs whenever locationId changes

  if (!chartData) {
    return <div className="chart-placeholder">Select a location on the map to view its 7-day AQI history.</div>;
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `7-Day AQI History for ${locationId}`,
      },
    },
  };

  return (
    <div className="chart-container">
      <Line data={chartData} options={options} />
    </div>
  );
}

export default ChartComponent;