import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Chart } from "chart.js/auto";
import "./Chart.css";
import zoomPlugin from "chartjs-plugin-zoom";

const LineChart = forwardRef((props, ref) => {
  Chart.register(zoomPlugin);
  const { apidata } = props;
  console.log(apidata, "response.data 1st time valaaaaa from chart");

  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    const times = [];
    const times_concat = [];
    const datasets = [];
    const dataSize = apidata.length;
    const dataLimit = 5000; // Maximum data points to display without downsampling

    if (dataSize <= dataLimit) {
      apidata.forEach((row) => {
        const timestamp = row.Timestamp;
        const time = timestamp.substring(11, 19);
        const date = timestamp.substring(0, 10);
        console.log(date, time, "akshat");

        const parts = date.split("-");
        const year = parts[0].substring(2); // Extract the last two digits of the year
        const month = parseInt(parts[1], 10); // Parse the month as an integer
        const day = parseInt(parts[2], 10); // Parse the day as an integer
        const formattedDate = `${day}/${month}/${year}`;
        console.log(formattedDate);

        const data = {};

        Object.keys(row).forEach((key) => {
          if (key !== "Timestamp") {
            const lowercaseKey = key.toLowerCase();
            data[lowercaseKey] = parseInt(row[key]);
          }
        });

        times.push(`${date} ${time}`);
        times_concat.push(`${formattedDate} ${time}`);
        datasets.push(data);
      });
    } else {
      const skip = Math.ceil(dataSize / dataLimit);
      for (let i = 0; i < dataSize; i += skip) {
        const row = apidata[i];
        const timestamp = row.Timestamp;
        const time = timestamp.substring(11, 19);
        const date = timestamp.substring(0, 10);

        const parts = date.split("-");
        const year = parts[0].substring(2); // Extract the last two digits of the year
        const month = parseInt(parts[1], 10); // Parse the month as an integer
        const day = parseInt(parts[2], 10); // Parse the day as an integer
        const formattedDate = `${day}/${month}/${year}`;
        console.log(formattedDate);

        const data = {};

        Object.keys(row).forEach((key) => {
          if (key !== "Timestamp") {
            const lowercaseKey = key.toLowerCase();
            data[lowercaseKey] = parseInt(row[key]);
          }
        });

        times.push(`${date} ${time}`);
        times_concat.push(`${formattedDate} ${time}`);
        datasets.push(data);
      }
    }

    let chartStatus = Chart.getChart("myChart");
    if (chartStatus !== undefined) {
      chartStatus.destroy();
    }

    if (chartRef.current && datasets.length > 0) {
      createChart(times_concat, datasets);
    }
  }, [apidata]);

  useEffect(() => {
    const scroller = (e) => {
      const { deltaY, target } = e;
      const { min, max } = chartInstance.config.options.scales.x;

      if (target === chartRef.current) {
        e.preventDefault();

        if (deltaY > 0 && max < chartInstance.config.data.labels.length - 1) {
          chartInstance.config.options.scales.x.min += 60;
          chartInstance.config.options.scales.x.max += 60;
        } else if (deltaY < 0 && min > 0) {
          chartInstance.config.options.scales.x.min -= 60;
          chartInstance.config.options.scales.x.max -= 60;
        }

        chartInstance.update();
      }
    };

    if (chartInstance) {
      chartRef.current.addEventListener("wheel", scroller, { passive: false });
    }

    // Cleanup function
    const cleanup = () => {
      if (chartInstance && chartRef.current) {
        chartRef.current.removeEventListener("wheel", scroller);
      }
    };

    return cleanup;
  }, [chartInstance]);

  const createChart = (times, datasets) => {
    const ctx = chartRef.current.getContext("2d");

    if (chartInstance) {
      chartInstance.destroy();
    }

    const dynamicDatasets = Object.keys(datasets[0]).map((key) => ({
      label: key,
      data: datasets.map((data) => data[key]),
      borderWidth: 0.7,
      pointRadius: 0,
    }));

    const bgColor = {
      id: "bgColor",
      beforeDraw: (chart, steps, options) => {
        const { ctx, width, height } = chart;
        ctx.fillStyle = options.backgroundColor || "white";
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      },
    };

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: times,
        datasets: dynamicDatasets,
      },
      options: {
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 10,
          },
        },
        scales: {
          x: {
            min: 0,
            max: 60,
          },
          y: {
            ticks: {
              display: true,
            },
            grid: {
              drawTicks: false,
              drawBorder: false,
            },
          },
        },
        plugins: {
          legend: {
            display: true,
          },
          bgColor: {
            backgroundColor: "white",
          },
        },
        plugins: [bgColor],
      },
    });

    setChartInstance(chart);
  };

  useImperativeHandle(ref, () => ({
    getChartCanvas: () => chartRef.current,
    getChartInstance: () => chartInstance,
    resetZoom: () => {
      if (chartInstance) {
        chartInstance.resetZoom();
      }
    },
  }));

  return (
    <div className="chart_container">
      <canvas ref={chartRef}></canvas>
    </div>
  );
});

export default LineChart;
