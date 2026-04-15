import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/sora';
import '@fontsource/ibm-plex-mono';

import App from './App.jsx';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
