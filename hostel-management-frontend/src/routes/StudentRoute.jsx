import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StudentRoute = ({ component: Component, ...rest }) => {
  const { user, loading } = useAuth();

  return (
    <Route
      {...rest}
      render={props =>
        loading ? (
          <div>Loading...</div>
        ) : user && user.role === 'student' ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default StudentRoute;