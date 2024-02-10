import React from 'react';
import './App.css';
import Camera from './Pages/Camera';
import CustomWebcam from './Pages/CustomWebcam';

const App = () => {

  return(
    <div className='app-container'>
      <h1>Face Dectection App</h1>
      
      <CustomWebcam />
      {/*<Camera />*/}
    </div>
  );


  
};

export default App;
