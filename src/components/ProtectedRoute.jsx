import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ isLoggedIn, userRole, allowedRoles, children }) => {
  const role = userRole?.toLowerCase().trim();

    if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;