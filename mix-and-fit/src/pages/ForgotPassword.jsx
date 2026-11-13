import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { Link } from "react-router-dom";
import { auth } from "../firebase";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(
        "If an account exists for this email, a reset link is on its way. Check your spam folder too."
      );
    } catch (err) {
      if (err.code === "auth/invalid-email") {
        setError("This email address is not valid.");
      } else {
        setError("Could not send the email (" + err.code + ").");
      }
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>Reset password</h1>
        <p className="muted center">We'll email you a link to choose a new one.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn-full">Send reset link</button>
        </form>
        {message && <p className="notice">{message}</p>}
        {error && <p className="error">{error}</p>}
        <p className="muted center spaced">
          <Link to="/login">Back to log in</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;