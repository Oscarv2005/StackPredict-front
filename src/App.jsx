import { useState } from "react";
import "./index.css";
import Nav from "./nav";
import Hero from "./hero";
import Form from "./form";

function App() {
  const [page, setPage] = useState("home");

  return (
    <div className="app">
      <Nav page={page} setPage={setPage} />
      <div id="home" className={`page ${page === "home" ? "active" : ""}`}>
        <Hero setPage={setPage} />
      </div>
      <div id="form" className={`page ${page === "form" ? "active" : ""}`}>
        <Form />
      </div>
    </div>
  );
}

export default App;
