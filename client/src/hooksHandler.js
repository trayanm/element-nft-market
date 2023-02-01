import { useLocation, useNavigate, useParams } from "react-router-dom";

export const withRouter = (Component) => {
  const WithRouter = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    return <Component {...props} location={location} navigate={navigate} params={params} />;
  }
  return WithRouter;
}