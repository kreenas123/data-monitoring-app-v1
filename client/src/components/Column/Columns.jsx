import React, { useEffect, useRef, useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import { Button, TextField, Typography } from "@mui/material";

import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import Table from '../Table/Table';
import LineChart from '../Chart/LineChart';
import criton from "../../images/criton.png";

import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import autoTable from "jspdf-autotable";
import axios from 'axios'

const Columns = (props) => {
  const propKeys = Object.keys(props);

  useEffect(() => {
    propKeys.forEach(prop => {
      console.log(`${prop}: ${props[prop]}`);
    });
  }, [propKeys, props]);

  const {columnName} = props;

  const [open, setOpen] = React.useState(false);
  // const [startDate, setStartDate] = useState("");
  // const [endDate, setEndDate] = useState("");
  // const [startTime, setStartTime] = useState("");
  // const [endTime, setEndTime] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("23:00:00");

  const [apiData, setApiData] = useState([]);

  // Convert string to ArrayBuffer
  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  };

  const downloadTable = (format) => {
    const table = document.getElementById("table_with_data");
    const tableData = Array.from(table.querySelectorAll("tr")).map((row) =>
      Array.from(row.querySelectorAll("th, td")).map((cell) => cell.textContent)
    );

    if (format === "csv") {
      // Export to CSV
      const csvData = tableData.map((row) => row.join(",")).join("\n");
      const csvBlob = new Blob([csvData], { type: "text/csv" });
      const csvUrl = URL.createObjectURL(csvBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = csvUrl;
      downloadLink.download = "table.csv";
      downloadLink.click();
    } else if (format === "excel") {
      // Export to Excel
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(tableData);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet 1");
      const excelData = XLSX.write(workbook, {
        type: "binary",
        bookType: "xlsx",
      });
      const excelBlob = new Blob([s2ab(excelData)], {
        type: "application/octet-stream",
      });
      const excelUrl = URL.createObjectURL(excelBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = excelUrl;
      downloadLink.download = "table.xlsx";
      downloadLink.click();
    } else if (format === "pdf") {
      const doc = new jsPDF();

      const header = function (data) {
        doc.setFontSize(10);
        doc.setTextColor(40);
        // doc.text("Content", data.settings.margin.left, 35);
        doc.text(
          `Start DateTime: ${startDate} - ${startTime}`,
          data.settings.margin.left,
          35
        );
        doc.text(
          `End DateTime: ${endDate} - ${endTime}`,
          data.settings.margin.left,
          45
        );
        doc.addImage(
          criton,
          "PNG",
          data.settings.margin.left,
          5,
          60,
          20
        );
        // doc.text(
        //   "Header bottom margin",
        //   data.settings.margin.left,
        //   doc.internal.pageSize.height - 20
        // );
      };

      const footer = function (data) {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(
          "Page " + data.pageNumber + " of " + pageCount,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      };

      // const additionalContent = function (data) {
      //   doc.setFontSize(12);
      //   doc.text(
      //     "Additional content goes here.",
      //     20,
      //     doc.internal.pageSize.height - 200
      //   );
      // };

      const tableHeaders = table.querySelectorAll("th");
      const tableRows = table.querySelectorAll("tbody tr");

      const headers = Array.from(tableHeaders).map((header) => header.textContent);
      const data = Array.from(tableRows).map((row) =>
        Array.from(row.querySelectorAll("td")).map((cell) => cell.textContent)
      );

      doc.autoTable({
        head: [headers],
        body: data,
        startY: 50,
        didDrawPage: function (data) {
          if (data.pageNumber === 1) {
            header(data);
          }
          footer(data);
        },
      });

      doc.save("table.pdf");
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = (event, reason) => {
    if (reason !== 'backdropClick') {
      setOpen(false);
    }
  };

  const chartRef = useRef(null);

  const resetChartZoom = () => {
    chartRef.current.getChartInstance().resetZoom();
  };

  const zoomIn = () => {
    if (chartRef.current) {
      chartRef.current.getChartInstance().zoom(1.1);
    }
  };

  const zoomOut = () => {
    if (chartRef.current) {
      chartRef.current.getChartInstance().zoom(0.9);
    }
  };
  
  const fetchData = async () => {
    try {
      const apiUrl = `http://localhost:8080/api/data?startDate=${startDate}&endDate=${endDate}&startTime=${startTime}&endTime=${endTime}`;
      // const apiUrl = `https://weary-jay-ring.cyclic.app/api/data?startDate=${startDate}&endDate=${endDate}&startTime=${startTime}&endTime=${endTime}`;
      const response = await axios.get(apiUrl);
      setApiData(response.data);
      console.log(response.data, "response.data 1st time valaaaaa from columns component");
    }
    catch (error) {
      console.error(error);
    }
  }
  
  useEffect(() => {
    fetchData()
  },[])

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "startDate") {
      setStartDate(value);
    } else if (name === "endDate") {
      setEndDate(value);
    } else if (name === "startTime") {
      setStartTime(value);
    } else if (name === "endTime") {
      setEndTime(value);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchData();
  };

  const extractDataByColumn = (data, column) => {
    const extractedData = data.map((row) => ({
      Timestamp: row.Timestamp,
      [column]: row[column],
    }));
    return extractedData;
  };

  const colData = columnName ? extractDataByColumn(apiData, columnName) : apiData;


  return (
    <>
      <div className='graph-header flex'>
        <div>
          <form onSubmit={handleSubmit}>
            <div className="date_container flex">
              <div className='start flex'>
              <Typography>Start Date</Typography>
              <TextField
                size="small"
                type="date"
                name="startDate"
                variant="outlined"
                value={startDate}
                onChange={handleInputChange}
              />
              </div>
              <div className='end flex'>
              <Typography>End Date</Typography>
              <TextField
                size="small"
                type="date"
                name="endDate"
                variant="outlined"
                value={endDate}
                onChange={handleInputChange}
              />
              </div>
            </div>
            <br />
            <div className="time_container flex">
            <div className='start flex'>
              <Typography>Start Time</Typography>
              <TextField
                className='filter-input'
                size="small"
                type="time"
                name="startTime"
                variant="outlined"
                inputProps={{
                  step: 1, // Allows seconds input
                }}
                value={startTime}
                onChange={handleInputChange}
              />
              </div>
              <div className='end flex'>
              <Typography>End Time</Typography>
              <TextField
                className='filter-input'
                size="small"
                type="time"
                name="endTime"
                variant="outlined"
                inputProps={{
                  step: 1, // Allows seconds input
                }}
                value={endTime}
                onChange={handleInputChange}
              />
              </div>
            </div>
            <br />
            <Button type="submit" variant="contained">
              Apply Filter
            </Button>
          </form>
        </div>
        <div>
          <Tooltip title="Reset" arrow>
            <Button variant="contained" className='graph-btns' onClick={resetChartZoom}>
              <RotateLeftIcon></RotateLeftIcon>
            </Button>
          </Tooltip>
          <Tooltip title="Zoom In" arrow>
            <Button variant="contained" className='graph-btns' onClick={zoomIn}>
              <ZoomInIcon></ZoomInIcon>
            </Button>
          </Tooltip>
          <Tooltip title="Zoom Out" arrow>
            <Button variant="contained" className='graph-btns' onClick={zoomOut}>
              <ZoomOutIcon></ZoomOutIcon>
            </Button>
          </Tooltip>
        </div>
      </div>
      <div >
      {columnName ? (
          <LineChart apidata={colData}  ref={chartRef} />
        ) : (
          <LineChart apidata={apiData}  ref={chartRef}/>
        )}
      </div>
      <div className='table-header flex'>
        <h1>Tabular Data</h1>
        <Tooltip title="Download Report" arrow>
          <div>
            <Button variant="contained" className='graph-btns' onClick={handleClickOpen}>
              <FileDownloadIcon></FileDownloadIcon>
            </Button>
            <Dialog disableEscapeKeyDown open={open} onClose={handleClose}>
              {/* <DialogTitle>Export As</DialogTitle> */}
              <DialogContent>
                <Box sx={{ display: 'flex' }}>
                  <Button variant="contained" onClick={() => downloadTable("pdf")} className='export-options'>PDF</Button>
                  <Button variant="contained" onClick={() => downloadTable("csv")} className='export-options'>CSV</Button>
                  <Button variant="contained" onClick={() => downloadTable("excel")} className='export-options'>Excel</Button>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Ok</Button>
              </DialogActions>
            </Dialog>
          </div>
        </Tooltip>
      </div>
      <div id="table_with_data">
      {columnName ? (
          <Table apidata={colData} />
        ) : (
          <Table apidata={apiData} />
        )}
      </div>
    </>
  );
};

export default Columns;