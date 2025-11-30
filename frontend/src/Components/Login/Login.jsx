import { useState } from "react";
import { useNavigate } from "react-router-dom";

const apiBase = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

const Login = ({switchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error,setError] = useState('');
    const navigate = useNavigate();

    async function submit(e) {
    e.preventDefault();
    setError("");

    try {
        const res = await fetch(`${apiBase}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
        setError(data.error || "Login failed");
        return;
        }
        localStorage.setItem("token", JSON.stringify(data.token));
        localStorage.setItem("user", JSON.stringify(data.name));

        navigate("/dashboard");
    } catch (err) {
        console.error("Network error", err);
        setError("Network error");
    }
    }


  return (
   <div className='innerBox'>
      <div className="text-head login">
          <h1>Log in</h1>
        </div>
      <form onSubmit={submit}>
        <div className="form-floating mb-3">
            <input type="name" className="form-control" id="login-email" placeholder="Enter Your Email" required value={email} onChange={e=>setEmail(e.target.value)}/>
            <label htmlFor="login-email">Email</label>
        </div>
        <div className="form-floating mb-3">
            <input type="password" className="form-control" id="login-password" placeholder="Enter Your Password" required value={password} onChange={e=>setPassword(e.target.value)}/>
            <label htmlFor="login-password">Password</label>
        </div>
        <div className="col-12">
            <button type="submit" className='submitButton'>Login</button>
        </div>
        <div style={{color:'red', marginTop:6}}>{error}</div>
        <p>
        Don't have an account?{" "}
        <button  className="switchButton" onClick={switchToRegister}>
          Register
        </button>
      </p>
      </form>
    </div>
  )
}
export default Login
