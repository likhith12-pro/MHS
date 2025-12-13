import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './components/Header';
import { AuthProvider } from './context/AuthContext';
import AdminRoute from './routes/AdminRoute';
import StudentRoute from './routes/StudentRoute';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import StudentDashboard from './pages/StudentDashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/login" component={Login} />
        <AdminRoute path="/admin" component={AdminDashboard} />
        <StudentRoute path="/student" component={StudentDashboard} />
        <Route path="*" component={NotFound} />
        </Switch>
      </AuthProvider>
    </Router>
  );
};

export default App;