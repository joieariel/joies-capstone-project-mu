import "./App.css";
import LandingPage from "./LandingPage";
import Header from "./Header";
import SignUp from "./SignUp";
import Login from "./Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";

const App = () => {
  // hooks up here

  return (
    // wrap the app in the auth provider, now everything inside will have access to user state, login/out functions, etc.
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
