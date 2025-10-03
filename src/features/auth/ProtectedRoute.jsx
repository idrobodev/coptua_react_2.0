import React from "react";
import { Redirect, Route } from "react-router-dom";
import { useAuth } from "shared/contexts";

const PrivateRoute = ({ children, ...rest }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Route
      {...rest}
      render={({ location }) => {
        const isAuthenticated = currentUser?.email;
        
        return isAuthenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location },
            }}
          />
        );
      }}
    />
  );
};

export default PrivateRoute;
