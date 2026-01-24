import React, { useState } from "react";
import "./CSS/LoginSignup.css";
import { backend_url } from "../App";

const LoginSignup = () => {

  const [state,setState] = useState("Login");
  const [formData,setFormData] = useState({username:"",email:"",password:""});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const changeHandler = (e) => {
    setFormData({...formData,[e.target.name]:e.target.value});
    setError(""); // Clear error when user types
    }

  const login = async () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const resp = await fetch(`${backend_url}/login`, {
        method: 'POST',
        headers: {
          Accept:'application/form-data',
          'Content-Type':'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!resp.ok) {
        throw new Error(`Server error: ${resp.status}`);
      }
      
      const dataObj = await resp.json();
      console.log(dataObj);
      
      if (dataObj.success) {
        localStorage.setItem('auth-token',dataObj.token);
        window.location.replace("/");
      }
      else {
        setError(dataObj.errors || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Failed to connect to server. Please make sure the server is running.");
    } finally {
      setLoading(false);
    }
  }

  const signup = async () => {
    if (!formData.email || !formData.password || !formData.username) {
      setError("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const resp = await fetch(`${backend_url}/signup`, {
        method: 'POST',
        headers: {
          Accept:'application/form-data',
          'Content-Type':'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!resp.ok) {
        throw new Error(`Server error: ${resp.status}`);
      }
      
      const dataObj = await resp.json();

      if (dataObj.success) {
        localStorage.setItem('auth-token',dataObj.token);
        window.location.replace("/");
      }
      else {
        setError(dataObj.errors || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("Failed to connect to server. Please make sure the server is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>
        {error && <div style={{padding: '10px', marginBottom: '10px', color: 'red', backgroundColor: '#ffe6e6', borderRadius: '5px'}}>{error}</div>}
        <div className="loginsignup-fields">
          {state==="Sign Up"?<input type="text" placeholder="Your name" name="username" value={formData.username} onChange={changeHandler}/>:<></>}
          <input type="email" placeholder="Email address" name="email" value={formData.email} onChange={changeHandler}/>
          <input type="password" placeholder="Password" name="password" value={formData.password} onChange={changeHandler}/>
        </div>

        <button onClick={()=>{state==="Login"?login():signup()}} disabled={loading}>
          {loading ? "Please wait..." : "Continue"}
        </button>

        {state==="Login"?
        <p className="loginsignup-login">Create an account? <span onClick={()=>{setState("Sign Up"); setError("");}}>Click here</span></p>
        :<p className="loginsignup-login">Already have an account? <span onClick={()=>{setState("Login"); setError("");}}>Login here</span></p>}

        <div className="loginsignup-agree">
          <input type="checkbox" name="" id="" />
          <p>By continuing, i agree to the terms of use & privacy policy.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
