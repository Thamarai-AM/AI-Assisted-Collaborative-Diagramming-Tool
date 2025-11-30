import React, { useState } from "react";
import './Home.css'
import Login from "../Login/Login";
import Register from "../Register/Register";
import logo from '../../assets/logo.png'
import darklogo from '../../assets/darklogo.png'
const Home = () => {
    const [activeTab, setActiveTab] = useState("login");
  return (
    <div className="container-fluid home">
        <div className="row justify-content-center align-items-center home-width">
            <div className="col">
                  <div className="homelogo"></div>
            </div>
        </div>
        <div className="row justify-content-center home-width bg-grid">
            <div className="max-w-md mx-auto p-4">
                {activeTab === "login" ? (
                    <Login switchToRegister={() => setActiveTab("register")} />
                ) : (
                    <Register switchToLogin={() => setActiveTab("login")} />
                )}
            </div>
        </div>
        <div className="row"></div>
    </div>
  )
}

export default Home
