import "./index.css";

function Nav({ page, setPage }) {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div
          className="logo"
          onClick={() => setPage("home")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setPage("home")}
        >
          <div className="logo-symbol">S</div>
          <span className="logo-text">StackPredict</span>
        </div>
        <ul className="nav-links">
          <li>
            <a
              href="#"
              className={page === "home" ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setPage("home");
              }}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#"
              className={page === "form" ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setPage("form");
              }}
            >
              Form
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Nav;
