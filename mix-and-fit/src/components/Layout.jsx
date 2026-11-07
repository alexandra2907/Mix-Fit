import { Link, NavLink, Outlet } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../AuthContext";

function Layout() {
  const { user } = useAuth();

  return (
    <div>
      <header className="topbar">
        <Link to="/" className="logo">Mix &amp; Fit</Link>
        <nav className="nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/closet">My closet</NavLink>
        </nav>
        <div className="topbar-right">
          <span>{user.displayName || user.email}</span>
          <button className="btn-ghost btn-small" onClick={() => signOut(auth)}>
            Log out
          </button>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;