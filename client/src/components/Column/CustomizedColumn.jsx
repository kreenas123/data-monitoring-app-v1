import React, { useEffect, useRef, useState } from "react";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { Button, TextField, Typography } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import { Check } from "@mui/icons-material";

import { styled } from "@mui/material/styles";

import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import Table from "../Table/Table";
import LineChart from "../Chart/LineChart";
import criton from "../../images/criton.png";
import config from '../../config.json'

import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import autoTable from "jspdf-autotable";
import axios from "axios";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";

const Columns = (props) => {
  const propKeys = Object.keys(props);

  useEffect(() => {
    propKeys.forEach((prop) => {
      console.log(`${prop}: ${props[prop]}`);
    });
  }, [propKeys, props]);

  const { columnName, databaseName } = props;
  // console.log(databaseName,"databaseName",typeof(databaseName))

  let AllColumns = []
  const entries = Object.entries(config.databases);

  for (const [index, [key, value]] of entries.entries()) {
    // console.log(`Entry ${index}: Key = ${key}, Value =`, value);
    // console.log(value.db_name)
    if(value.db_name == databaseName){
      // console.log(value.db_name,key,"oh please")
      AllColumns = Object.values(value.db_columns)
    }
  }

  // console.log(AllColumns,"yess finally I got all columns")

  const currentDate = new Date();
  const defaultStartDate = currentDate.toISOString().split("T")[0];
  const defaultStartTime = "00:00:00";
  const defaultEndDate = currentDate.toISOString().split("T")[0];
  const defaultEndTime = "23:00:00";

  const [startDateTime, setStartDateTime] = useState(`${defaultStartDate}T${defaultStartTime}`);
  const [endDateTime, setEndDateTime] = useState(`${defaultEndDate}T${defaultEndTime}`);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("23:00:00");
  const [columnNameList, setColumnNameList] = React.useState([]);
  const [colData, setcolData] = React.useState([]);
  const [imageDataURL, setImageDataURL] = useState("");
  const [checked, setChecked] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [apiData, setApiData] = useState([]);
  const [customizeY,setCustomizeY] = useState(false);

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  // Convert string to ArrayBuffer
  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  };

  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  useEffect(() => {
    // Fetch the image and convert it to base64
    const fetchImageAsBase64 = async () => {
      try {
        const response = await fetch(criton);
        const imageBlob = await response.blob();
        const imageBase64 = await convertBlobToBase64(imageBlob);
        setImageDataURL(imageBase64);
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    fetchImageAsBase64();
  }, []);

  const downloadTable = async (format) => {
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
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet 1");

      const logo = workbook.addImage({
        base64: imageDataURL, // Assuming criton.png is available in your project folder
        extension: "png",
      });

      // Define the position and dimensions of the logo
      const logoStartCol = 0;
      const logoStartRow = 0;
      const logoEndCol = 180;
      const logoEndRow = 60;

      worksheet.addImage(logo, {
        tl: { col: logoStartCol, row: logoStartRow }, // Top-left cell position
        ext: { width: logoEndCol, height: logoEndRow }, // Image width and height (adjust as needed)
      });

      // Add some space between the image and table data
      const spaceRows = 3; // Adjust the number of rows as needed
      for (let i = 0; i < spaceRows; i++) {
        worksheet.addRow([]);
      }

      // After adding the space, rowsMerge the cells
      const mergeStartRow = 1; // Start row index for merging (1-based index)
      const mergeEndRow = spaceRows; // End row index for merging (1-based index)
      const mergeStartCol = 1; // Start column index for merging (1-based index)
      const mergeEndCol = 3; // End column index for merging (1-based index)

      worksheet.mergeCells(
        mergeStartRow,
        mergeStartCol,
        mergeEndRow,
        mergeEndCol
      );

      if (checked) {
        const chartWrapper = document.querySelector(".chart-wrapper");
        const canvas = await html2canvas(chartWrapper, {
          scale: 2, // Adjust scale as needed for image quality
        });
        const chartImage = canvas.toDataURL("image/png");

        // Add the chart to the worksheet
        const chartImg = workbook.addImage({
          base64: chartImage, // Chart which is being displayed
          extension: "png",
        });

        // Define the position and dimensions of the logo
        const chartImgStartCol = 0;
        const chartImgStartRow = 4;
        const chartImgEndCol = 800;
        const chartImgEndRow = 400;

        worksheet.addImage(chartImg, {
          tl: { col: chartImgStartCol, row: chartImgStartRow }, // Top-left cell position
          ext: { width: chartImgEndCol, height: chartImgEndRow }, // Image width and height (adjust as needed)
        });

        // Add some space between the image and table data
        const chartSpaceRows = 25; // Adjust the number of rows as needed
        for (let i = 4; i < chartSpaceRows; i++) {
          worksheet.addRow([]);
        }

        // After adding the space, rowsMerge the cells
        const mergeChartStartRow = 4; // Start row index for merging (1-based index)
        const mergeChartEndRow = chartSpaceRows; // End row index for merging (1-based index)
        const mergeChartStartCol = 1; // Start column index for merging (1-based index)
        const mergeChartEndCol = 13; // End column index for merging (1-based index)

        worksheet.mergeCells(
          mergeChartStartRow,
          mergeChartStartCol,
          mergeChartEndRow,
          mergeChartEndCol
        );
      }

      // Add the table data to the worksheet
      const tableHeaders = table.querySelectorAll("th");
      const tableRows = table.querySelectorAll("tbody tr");

      const headers = Array.from(tableHeaders).map(
        (header) => header.textContent
      );
      const data = Array.from(tableRows).map((row) =>
        Array.from(row.querySelectorAll("td")).map((cell) => cell.textContent)
      );

      worksheet.addRow(headers);
      data.forEach((row) => worksheet.addRow(row));

      // Save the Excel file and trigger the download
      const excelBlob = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([excelBlob], { type: "application/octet-stream" }),'table.xlsx');
    } else if (format === "pdf") {
      let chartImage = "";
      if (chartRef.current) {
        const chartCanvas = chartRef.current.getChartCanvas();
        if (chartCanvas) {
          chartImage = chartCanvas.toDataURL("image/jpeg", 1.0);
          // console.log(chartImage);
        }
      }

      const doc = new jsPDF("landscape");

      const header = function (data) {
        doc.setFontSize(10);
        doc.setTextColor(40);
        // doc.text("Content", data.settings.margin.left, 35);
        doc.text(
          `Start DateTime: ${startDate} - ${startTime} && End DateTime: ${endDate} - ${endTime}`,
          data.settings.margin.left,
          35
        );
        doc.addImage(criton, "PNG", data.settings.margin.left, 5, 60, 20);
        if (checked) {
          doc.addImage(chartImage, "JPEG", 14, 40, 270, 120);
        }
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

      const headers = Array.from(tableHeaders).map(
        (header) => header.textContent
      );
      const data = Array.from(tableRows).map((row) =>
        Array.from(row.querySelectorAll("td")).map((cell) => cell.textContent)
      );

      const startY = checked ? 170 : 40;

      doc.autoTable({
        head: [headers],
        body: data,
        startY: startY,
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
    if (reason !== "backdropClick") {
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
      // console.log(
      //   response.data,
      //   "response.data 1st time valaaaaa from columns component"
      // );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "startDateTime") {
      setStartDateTime(value);
      const [date, time] = value.split("T");
      setStartDate(date);
      setStartTime(time);
    } else if (name === "endDateTime") {
      const [date, time] = value.split("T");
      setEndDateTime(value);
      setEndDate(date);
      setEndTime(time);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchData();
  };
  
  const extractDataByColumn = (data, columns) => {
    const columnss = columns ? columns : AllColumns
  
    const extractedData = data.map((row) => {
      const rowData = { Timestamp: row.Timestamp };
      columnss.forEach((column) => {
        rowData[column] = row[column];
      });
      return rowData;
    });
  console.log(extractedData,"extractData")
    return extractedData;
  };

  useEffect(() =>{
    console.log(customizeY)
    if(customizeY){
      const a = extractDataByColumn(apiData, columnNameList);
      setcolData(a)
      console.log(a,"heyaaaaaaaaaaaaaaaaaaaaaaaaaa")
    }
  },[customizeY])

  const handleIncludeChart = (event) => {
    setChecked(event.target.checked);
  };

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setColumnNameList(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const customizeYaxis = () =>{
      console.log("yeahhhhhhhhhhhhhhhh",columnNameList)
    setCustomizeY(true)
  }

  return (
    <>
      <div className="graph-header flex">
        <div className="date_container">
          <form onSubmit={handleSubmit}>
            {/* <Typography>Start Date</Typography> */}
            <TextField
              size="small"
              type="datetime-local"
              InputProps={{
                step: 1, // Specify the time step in seconds
                inputProps: {
                  step: 1, // Specify the step attribute for seconds
                },
              }}
              name="startDateTime"
              variant="outlined"
              value={startDateTime}
              onChange={handleInputChange}
            />
            {/* <Typography>End Date</Typography> */}
            <TextField
              size="small"
              type="datetime-local"
              InputProps={{
                step: 1, // Specify the time step in seconds
                inputProps: {
                  step: 1, // Specify the step attribute for seconds
                },
              }}
              name="endDateTime"
              variant="outlined"
              value={endDateTime}
              onChange={handleInputChange}
            />
            <Button size="small" type="submit" variant="contained">
              Apply Filter
            </Button>
          </form>
        </div>
        <div>
          <FormControl sx={{ m: 0.7, width: 160 }}>
            <InputLabel
              id="multiple-checkbox-label"
              sx={{fontSize:!5,marginTop:-1.5}}
            >
              Select Columns
            </InputLabel>
            <Select
              labelId="multiple-checkbox-label"
              id="multiple-checkbox"
              multiple
              size="small"
              value={columnNameList}
              onChange={handleChange}
              input={<OutlinedInput label="Select Columns" />}
              renderValue={(selected) => selected.join(", ")}
              sx={{ height: 30 }}
              MenuProps={MenuProps}
            >
              {AllColumns.map((name) => (
                <MenuItem key={name} value={name}>
                  <Checkbox checked={columnNameList.indexOf(name) > -1} />
                  <ListItemText primary={name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Check onClick={customizeYaxis}/>
          <Tooltip title="Reset" arrow>
            <RotateLeftIcon
              className="graph-header-icons"
              onClick={resetChartZoom}
            ></RotateLeftIcon>
          </Tooltip>
          <Tooltip title="Zoom In" arrow>
            <ZoomInIcon
              className="graph-header-icons"
              onClick={zoomIn}
            ></ZoomInIcon>
          </Tooltip>
          <Tooltip title="Zoom Out" arrow>
            <ZoomOutIcon
              className="graph-header-icons"
              onClick={zoomOut}
            ></ZoomOutIcon>
          </Tooltip>
          <Tooltip title="Download Report" arrow>
            <FileDownloadIcon
              className="graph-header-icons"
              onClick={handleClickOpen}
            ></FileDownloadIcon>
            <Dialog disableEscapeKeyDown open={open} onClose={handleClose}>
              <DialogContent sx={{ padding: 1, paddingBottom: 0 }}>
                <Box sx={{ display: "flex" }}>
                  <Button
                    variant="contained"
                    onClick={() => downloadTable("pdf")}
                    className="export-options"
                  >
                    PDF
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => downloadTable("csv")}
                    className="export-options"
                  >
                    CSV
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => downloadTable("excel")}
                    className="export-options"
                  >
                    Excel
                  </Button>
                </Box>
                <FormControlLabel
                  sx={{ mt: 0.8, ml: 0.2 }}
                  control={
                    <Checkbox
                      checked={checked}
                      onChange={handleIncludeChart}
                      sx={{
                        color: "#034694",
                        "&.Mui-checked": {
                          color: "#034694",
                        },
                      }}
                      inputProps={{ "aria-label": "controlled" }}
                    />
                  }
                  label={
                    <Typography variant="body1" component="span">
                      Include Chart
                    </Typography>
                  }
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} sx={{ color: "#034694" }}>
                  Ok
                </Button>
              </DialogActions>
            </Dialog>
          </Tooltip>
        </div>
      </div>
      <div className="chart-wrapper">
        {console.log(colData,"pppppppppppppppppppppp")}
          <LineChart apidata={colData} ref={chartRef} />
      </div>
      <div className="table-header">
        <h1>Tabular Data</h1>
      </div>
      <div id="table_with_data">
        <Table apidata={colData} />
      </div>
    </>
  );
};

export default Columns;