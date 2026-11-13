import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { sendWelcomeEmail } from "../email";

function friendlyError(code) {
  if (code === "auth/email-already-in-use") return "This email already has an account.";
  if (code === "auth/weak-password") return "Password must have at least 6 characters.";
  if (code === "auth/invalid-email") return "This email address is not valid.";
  return "Something went wrong (" + code + ").";
}

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: username });

      try {
        await sendEmailVerification(result.user);
      } catch (e) {
        // the account exists, so don't block registration if this email fails
      }

      try {
        await sendWelcomeEmail(username, email);
      } catch (e) {
        // the welcome email is a bonus, so don't block registration if it fails
      }

      navigate("/");
    } catch (err) {
      setError(friendlyError(err.code));
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>Create your account</h1>
        <p className="muted center">Start building your digital closet.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-full">Register</button>
        </form>
        {error && <p className="error">{error}</p>}
        <p className="muted center spaced">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;