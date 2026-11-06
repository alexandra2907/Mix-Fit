import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";

function Home() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Mix & Fit</h1>
      <p>Welcome, {user.displayName || user.email}!</p>
      <p><Link to="/closet">My closet</Link></p>
      <button onClick={() => signOut(auth)}>Log out</button>
    </div>
  );
}

export default Home;