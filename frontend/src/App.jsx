import "./App.css";
import LandingPage from "./LandingPage";
import Header from "./Header";
import SignUp from "./SignUp";
import Login from "./Login";
import Dashboard from "./Dashboard";
import CommunityCenter from "./CommunityCenter";
import Reviews from "./Reviews";
import Resources from "./Resources";
import MapView from "./MapView";
import SpecificMap from "./SpecificMap";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";

// protected route component for authenticated users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// public route component for non-authenticated users
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/homepage" replace />;
};

const App = () => {
  return (
    // wrap the app in the auth provider, now everything inside will have access to user state, login/out functions, etc.
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <Routes>
            <Route
              path="/"
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignUp />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/homepage"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community-centers"
              element={
                <ProtectedRoute>
                  <CommunityCenter />
                </ProtectedRoute>
              }
            />
            <Route
              // updated route to accept centerId as a url param
              path="/reviews/:centerId"
              element={
                <ProtectedRoute>
                  <Reviews />
                </ProtectedRoute>
              }
            />
            <Route
              // route for specific center on map
              path="/map/:centerId"
              element={
                <ProtectedRoute>
                  <SpecificMap />
                </ProtectedRoute>
              }
            />
            {/* add route for mapview in community center */}
            <Route
              path="/mapview"
              element={
                <ProtectedRoute>
                  <MapView />
                </ProtectedRoute>
              }
            />

            <Route
              path="/resources"
              element={
                <ProtectedRoute>
                  <Resources />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
