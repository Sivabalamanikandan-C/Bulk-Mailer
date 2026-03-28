import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function EmailChart({ data }) {

  const chartData = {
    labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],

    datasets: [
      {
        label: "Emails Sent",
        data: data,

        backgroundColor: "#6366F1",   
        borderColor: "#4F46E5",       
        borderWidth: 1,
        hoverBackgroundColor: "#4338CA"
      }
    ]
  };

  return (
    <div className="bg-white p-6 rounded shadow">

      <h2 className="text-xl font-semibold mb-4">
        Weekly Email Analytics
      </h2>

      <Bar data={chartData} />

    </div>
  );
}

export default EmailChart;