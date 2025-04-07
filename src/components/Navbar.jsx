import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) =>
    location.pathname === path
      ? "border-mastersGreen text-mastersGreen"
      : "border-transparent text-gray-600 hover:text-mastersGreen hover:border-mastersGreen";

  return (
    <nav className="border-b mb-6 px-4 bg-white shadow-sm">
      <div className="max-w-6xl mx-auto flex space-x-6">
        <Link
          to="/"
          className={`py-4 border-b-2 font-semibold text-sm tracking-wide uppercase ${isActive("/")}`}
        >
          Leaderboard
        </Link>
        <Link
          to="/scorecard"
          className={`py-4 border-b-2 font-semibold text-sm tracking-wide uppercase ${isActive("/scorecard")}`}
        >
          Scorecard
        </Link>
        <Link
          to="/create"
          className={`py-4 border-b-2 font-semibold text-sm tracking-wide uppercase ${isActive("/create")}`}
        >
          Create Match
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
