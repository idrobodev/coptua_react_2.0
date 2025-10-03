import React, { useMemo, Suspense } from "react";
import { BrowserRouter as Router, Route, Switch, useLocation } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import AuthProvider from "shared/contexts/AuthContext";
import Footer from "components/layout/Footer";
import Header from "components/layout/Header";
import PrivateRoute from "features/auth/ProtectedRoute";
import About from "pages/About/About";
import Contact from "pages/Contact/Contact";
import Home from "pages/Home/Home";
import Login from "pages/Login/Login";
import NotFound from "pages/NotFound/NotFound";
import Programs from "pages/Programs/Programs";
import Donate from "pages/Donate/Donate";
import { PerformanceDebugOverlay, LoadingSpinner } from "components/ui";

// Lazy load dashboard components for better performance
const Dashboard = React.lazy(() => import("pages/Dashboard/Dashboard"));
const Finance = React.lazy(() => import("pages/Dashboard/Finance"));
const Configuracion = React.lazy(() => import("pages/Dashboard/Configuracion"));
const Participantes = React.lazy(() => import("pages/Dashboard/Participantes"));
const Formatos = React.lazy(() => import("pages/Dashboard/Formatos"));
const Sedes = React.lazy(() => import("pages/Dashboard/Sedes"));

// Component to conditionally render header and footer
const AppContent = React.memo(() => {
  const location = useLocation();
  
  // Memoize the dashboard route calculation to prevent unnecessary recalculations
  const isDashboardRoute = useMemo(() => {
    const dashboardPaths = ['/dashboard', '/participantes', '/financiero', '/configuracion', '/formatos', '/sedes'];
    return dashboardPaths.some(path => location.pathname.startsWith(path));
  }, [location.pathname]);

  return (
    <>
      {!isDashboardRoute && <Header />}
      <div className={!isDashboardRoute ? "pt-20" : ""}>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/programs">
            <Programs />
          </Route>
          <Route path="/contact">
            <Contact />
          </Route>
          <Route path="/donate">
            <Donate />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <PrivateRoute path="/dashboard">
            <Suspense fallback={<LoadingSpinner />}>
              <Dashboard />
            </Suspense>
          </PrivateRoute>
          <PrivateRoute path="/participantes">
            <Suspense fallback={<LoadingSpinner />}>
              <Participantes />
            </Suspense>
          </PrivateRoute>
          <PrivateRoute path="/financiero">
            <Suspense fallback={<LoadingSpinner />}>
              <Finance />
            </Suspense>
          </PrivateRoute>
          <PrivateRoute path="/configuracion">
            <Suspense fallback={<LoadingSpinner />}>
              <Configuracion />
            </Suspense>
          </PrivateRoute>
          <PrivateRoute path="/formatos">
            <Suspense fallback={<LoadingSpinner />}>
              <Formatos />
            </Suspense>
          </PrivateRoute>
          <PrivateRoute path="/sedes">
            <Suspense fallback={<LoadingSpinner />}>
              <Sedes />
            </Suspense>
          </PrivateRoute>
          <Route path="*">
            <NotFound />
          </Route>
        </Switch>
      </div>
      {!isDashboardRoute && <Footer />}
    </>
  );
});

function App() {
  return (
    <HelmetProvider>
      <div className="font-Poppins">
        <AuthProvider>
          <Router>
            <AppContent />
            <PerformanceDebugOverlay />
          </Router>
        </AuthProvider>
      </div>
    </HelmetProvider>
  );
}

export default App;
