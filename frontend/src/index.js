import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// Ant Design v4 : on importe ce fichier-là
import 'antd/dist/antd.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
