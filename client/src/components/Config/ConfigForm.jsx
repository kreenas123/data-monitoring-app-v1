import React, { useState } from "react";
import axios from "axios";

import { Button } from "@mui/material";

const ConfigForm = () => {
  const [databases, setDatabases] = useState([]);
  const [formData, setFormData] = useState({
    db_path: "",
    db_type: "",
    username: "",
    password: "",
    db: "",
    columns: [],
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleColumnInputChange = (index, event) => {
    const { value } = event.target;
    setFormData((prevFormData) => {
      const newColumns = [...prevFormData.columns];
      newColumns[index] = value;
      return {
        ...prevFormData,
        columns: newColumns,
      };
    });
  };

  const handleAddColumn = () => {
    setFormData((prevFormData) => {
      const newColumns = [...prevFormData.columns, ""];
      return {
        ...prevFormData,
        columns: newColumns,
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const newDatabase = {
      db_name: formData.db,
      db_columns: {},
      db_info: {
        db_path: formData.db_path,
        db_type: formData.db_type,
        username: formData.username,
        password: formData.password,
      },
    };

    formData.columns.forEach((column, index) => {
      const columnKey = `column${index + 1}`;
      newDatabase.db_columns[columnKey] = column;
    });

    setDatabases((prevDatabases) => [...prevDatabases, newDatabase]);

    setFormData({
      db_path: "",
      db_type: "",
      username: "",
      password: "",
      db: "",
      columns: [],
    });
  };

  const handleDone = () => {
    const config = {
      databases: {},
    };

    databases.forEach((database, index) => {
      const dbKey = `db${index + 1}`;
      config.databases[dbKey] = database;
    });

    // Make an API request to your server
    axios
      .post("http://localhost:8080/api", config)
      .then((response) => {
        console.log(response.data); // Optional: Handle server response
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div>
      <h1 className="form-header flex">CONFIGURATION</h1>
      <div className="form-content flex">
        <form onSubmit={handleSubmit}>
          <label>
            <div className="form-label flex">
              <h3>Database Path:</h3>
              <input
                className="form-input"
                type="text"
                name="db_path"
                value={formData.db_path}
                onChange={handleInputChange}
              />
            </div>
          </label>
          <label>
            <div className="form-label flex">
              <h3>Database Type:</h3>
              <input
                className="form-input"
                type="text"
                name="db_type"
                value={formData.db_type}
                onChange={handleInputChange}
              />
            </div>
          </label>
          <label>
            <div className="form-label flex">
              <h3>Username:</h3>
              <input
                className="form-input"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
          </label>
          <label>
            <div className="form-label flex">
              <h3>Password:</h3>
              <input
                className="form-input"
                type="text"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
          </label>
          <label>
            <div className="form-label flex">
              <h3>Database Name:</h3>
              <input
                className="form-input"
                type="text"
                name="db"
                value={formData.db}
                onChange={handleInputChange}
              />
            </div>
          </label>
          {formData.columns.map((column, index) => (
            <label key={index}>
              <div className="form-label flex">
                <h3>Column {index + 1}:</h3>
                <input
                  className="form-input"
                  type="text"
                  name={`column${index + 1}`}
                  value={column}
                  onChange={(event) => handleColumnInputChange(index, event)}
                />
              </div>
            </label>
          ))}
          <br />
          <Button
            variant="contained"
            className="btns"
            type="button"
            onClick={handleAddColumn}
          >
            Add Column
          </Button>
          <Button variant="contained" className="btns" type="submit">
            ADD
          </Button>
          <br />
          <Button variant="contained" className="btns" onClick={handleDone}>
            DONE
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ConfigForm;