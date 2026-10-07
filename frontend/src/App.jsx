import { useState, useEffect } from "react";
import "./index.css";
import Nav from "./nav";
import Hero from "./hero";
import Form from "./form";

function App() {
  const [page, setPage] = useState("home");
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved;
    } catch {
      /* ignore */
    }
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className="app">
      <Nav
        page={page}
        setPage={setPage}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <div id="home" className={`page ${page === "home" ? "active" : ""}`}>
        <Hero setPage={setPage} theme={theme} />
      </div>
      <div id="form" className={`page ${page === "form" ? "active" : ""}`}>
        {page === "form" && <Form />}
      </div>
    </div>
  );
}

export default App;
