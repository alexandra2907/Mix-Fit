import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../AuthContext";

function Home() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Mix & Fit</h1>
      <p>Welcome, {user.displayName || user.email}!</p>
      <button onClick={() => signOut(auth)}>Log out</button>
    </div>
  );
}

export default Home;