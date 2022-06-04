import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.css';
// import './style/custom.scss';

import App from './App';

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);