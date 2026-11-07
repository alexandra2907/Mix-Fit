import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Home() {
  const { user } = useAuth();

  return (
    <div className="card hero">
      <h1>Welcome, {user.displayName || user.email}!</h1>
      <p className="muted">Build your digital closet and mix outfits you love.</p>
      <Link to="/closet" className="btn">Open my closet</Link>
    </div>
  );
}

export default Home;