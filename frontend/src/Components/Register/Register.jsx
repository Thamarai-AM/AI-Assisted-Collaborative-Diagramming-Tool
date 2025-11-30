import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser  } from "../../api/api";

const apiBase = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

const Register = ({switchToLogin }) => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg,setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    try {
      const res = await fetch(`${apiBase}/register`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({name, email, password })
      });
      const data = await res.json();
      if(!res.ok) { setMsg(data.error || 'Error'); return; }
      setMsg('Registered! Now log in.');
    } catch (err) { setMsg('Network error'); }
  }


  return (
     <div className='innerBox'>
        <div className="text-head">
          <h1>Create account</h1>
        </div>
      <form onSubmit={submit}>
        <div className="form-floating mb-3">
            <input type="name" className="form-control" id="name" placeholder="Enter Your Name" required value={name} onChange={e=>setName(e.target.value)}/>
            <label htmlFor="name">Name</label>
        </div>
        <div className="form-floating mb-3">
            <input type="email" className="form-control" id="email" placeholder='Enter Your Email' required value={email} onChange={e=>setEmail(e.target.value)}  />
            <label htmlFor="email">Email address</label>
        </div>
        <div className="form-floating">
            <input type="password" className="form-control" id="password" placeholder="Password" required value={password} onChange={e=>setPassword(e.target.value)} />
            <label htmlFor="password">Password</label>
        </div>
        <div className="col-12">
            <button type="submit" className='submitButton'>Register</button>
        </div>
      </form>
      <div style={{marginTop:6, color:'green'}}>{msg}</div>
      <p>
        Already have an account?{" "}
        <button onClick={switchToLogin } className='switchButton'>
          Login
        </button>
      </p>
    </div>
  )
}

export default Register