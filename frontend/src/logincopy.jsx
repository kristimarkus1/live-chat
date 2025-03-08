import { useState } from "react";
import { loginUser, registerUser } from "./firebase";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegistering) {
        await registerUser(email, password);
      } else {
        await loginUser(email, password);
      }
      onLogin(); // Trigger login success
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="auth-container">
  <h2>{isRegistering ? "Register" : "Login"}</h2>
  <form onSubmit={handleSubmit}>
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
    <button type="submit">
      {isRegistering ? "Register" : "Login"}
    </button>
  </form>
  <p onClick={() => setIsRegistering(!isRegistering)}>
    {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
  </p>
</div>

  );
};

export default Login;
