import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
// import 'bootstrap/dist/css/bootstrap.css';
// import './style/custom.scss';

import AppContext from "./store/app-context";
import AppProvider from "./store/app-provider";

import App from './App';

ReactDOM.render(
  <BrowserRouter>
    <AppProvider >
      <App />
    </AppProvider>
  </BrowserRouter>,
  document.getElementById('root')
);