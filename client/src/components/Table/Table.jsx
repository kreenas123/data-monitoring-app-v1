import * as React from "react";
import { useState } from "react";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

const TableData = (props) => {
  const { apidata } = props;
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(1000);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {apidata.length > 0 &&
                  Object.keys(apidata[0]).map((column) => (
                    <TableCell align="center" key={column}>
                      {column}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {apidata
                .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                .map((row, index) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                    {Object.values(row).map((value, colIndex) => (
                      <TableCell key={colIndex} align="center">
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <div>
          <TablePagination
            rowsPerPageOptions={[200, 500, 1000]}
            component="div"
            count={apidata.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      </Paper>
    </>
  );
};

export default TableData;
