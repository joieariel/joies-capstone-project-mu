import "./App.css";
import Banner from "./Banner";
import Header from "./Header";
import SignUp from "./SignUp";
import Login from "./Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {
  // hooks up here

  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Banner />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
