import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, isLoggedIn, userRole, allowedRoles }) => {
  if (!isLoggedIn) return <Navigate to="/login" />;

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;