import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
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