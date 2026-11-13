import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { signOut, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../AuthContext";

function Layout() {
  const { user } = useAuth();
  const [info, setInfo] = useState("");

  async function resend() {
    try {
      await sendEmailVerification(user);
      setInfo("Verification email sent again.");
    } catch (err) {
      setInfo("Please wait a few minutes before asking again.");
    }
  }

  async function refresh() {
    await user.reload();
    window.location.reload();
  }

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

      {!user.emailVerified && (
        <div className="banner">
          <span>Please verify your email address using the link we sent you.</span>
          <button className="btn-ghost btn-small" onClick={resend}>Resend email</button>
          <button className="btn-ghost btn-small" onClick={refresh}>I've verified</button>
          {info && <span className="muted">{info}</span>}
        </div>
      )}

      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;