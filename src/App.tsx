import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ThreadList from "./pages/ThreadList";
import ThreadNew from "./pages/ThreadNew";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/threads" element={<ThreadList />} />
        <Route path="/threads/new" element={<ThreadNew />} />
      </Routes>
    </Router>
  );
};

export default App;
