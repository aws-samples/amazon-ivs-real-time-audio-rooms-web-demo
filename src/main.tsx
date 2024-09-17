import './index.css';

import { StrictMode } from 'react';
import ReactDom from 'react-dom/client';

import App from './App';

const container = document.getElementById('root') as HTMLElement;
const root = ReactDom.createRoot(container);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
