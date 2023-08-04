import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoadingPage from './components/Loading';
// import ConfigForm from './components/Config/ConfigForm'
import { useDispatch,useSelector } from 'react-redux';
import { setIsElectron } from './Redux/isElectron';
import { setIpcRenderer } from './Redux/ipcRenderer';
import { setDecryptConfig } from './Redux/decryptConfig';
import axios from "axios";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const dispatch = useDispatch();

  const fetchData = async () => {
    try {
      if (isElectron === "renderer") {
        ipcRenderer.send('request-config');
      } else {
        const response = await axios.get(`http://localhost:8080/api/decryptConfig`);
        console.log(response.data)
        dispatch(setDecryptConfig(response.data))
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Check if we are running in an Electron environment
    const isRunningInElectron = window && window.process && window.process.type;
    console.log(isRunningInElectron)
    if (isRunningInElectron !== undefined) {
      dispatch(setIsElectron(isRunningInElectron));
    }

    if (window && window.require) {
      const ipcRendererInstance = window.require('electron').ipcRenderer;
      dispatch(setIpcRenderer(ipcRendererInstance));
    }
    setReady(true)

  }, [dispatch]);

  useEffect(()=>{
    fetchData();
    if (isElectron === "renderer") {
      ipcRenderer.once('response-config', handleResponseData);
      return () => {
        ipcRenderer.removeListener('response-config', handleResponseData);
      };
    }
  },[ready])

  const isElectron = useSelector(state => state.isElectron);
  const ipcRenderer = useSelector(state => state.ipcRenderer);

  const handleResponseData = (event, data) => {
    console.log(data)
    dispatch(setDecryptConfig(data))
  };

  useEffect(() => {
    // Simulate an asynchronous operation
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  return (
    <div className="app">
      {isLoading ? (
        <LoadingPage />
      ) : (
        <div>
          <Navbar />
          {/* <ConfigForm></ConfigForm> */}
        </div>
      )}
    </div>
  );
};

export default App;
