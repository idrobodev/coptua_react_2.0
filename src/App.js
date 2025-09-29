import React from "react";
import { BrowserRouter as Router, Route, Switch, useLocation } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import AuthProvider from "./contexts/AuthContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import PrivateRoute from "./components/features/auth/ProtectedRoute";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Dashboard from "./pages/Dashboard/Dashboard";
import Finance from "./pages/Dashboard/Finance";
import Configuracion from "./pages/Dashboard/Configuracion";
import Participantes from "./pages/Dashboard/Participantes";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import NotFound from "./pages/NotFound/NotFound";
import Programs from "./pages/Programs/Programs";
import Donate from "./pages/Donate/Donate";
import Formatos from "./pages/Dashboard/Formatos";
import Sedes from "./pages/Dashboard/Sedes";

// Component to conditionally render header and footer
const AppContent = () => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard') ||
                          location.pathname.startsWith('/participantes') ||
                          location.pathname.startsWith('/financiero') ||
                          location.pathname.startsWith('/configuracion') ||
                          location.pathname.startsWith('/formatos') ||
                          location.pathname.startsWith('/sedes');

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
            <SidebarProvider>
              <Dashboard />
            </SidebarProvider>
          </PrivateRoute>
          <PrivateRoute path="/participantes">
            <SidebarProvider>
              <Participantes />
            </SidebarProvider>
          </PrivateRoute>
          <PrivateRoute path="/financiero">
            <SidebarProvider>
              <Finance />
            </SidebarProvider>
          </PrivateRoute>
          <PrivateRoute path="/configuracion">
            <SidebarProvider>
              <Configuracion />
            </SidebarProvider>
          </PrivateRoute>
          <PrivateRoute path="/formatos">
            <SidebarProvider>
              <Formatos />
            </SidebarProvider>
          </PrivateRoute>
          <PrivateRoute path="/sedes">
            <SidebarProvider>
              <Sedes />
            </SidebarProvider>
          </PrivateRoute>
          <Route path="*">
            <NotFound />
          </Route>
        </Switch>
      </div>
      {!isDashboardRoute && <Footer />}
    </>
  );
};

function App() {
  return (
    <HelmetProvider>
      <div className="font-Poppins">
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </div>
    </HelmetProvider>
  );
}

export default App;
