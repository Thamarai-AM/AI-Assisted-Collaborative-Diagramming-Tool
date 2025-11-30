import { useNavigate } from "react-router-dom";
import { useState,useEffect } from "react";

import './Header.css'
import refresh from '../../assets/refresh.png'
import refreshLight from '../../assets/refreshLight.png'
import question from '../../assets/question.png'
import questionLight from '../../assets/questionLight.png'
import bell from '../../assets/bell.png'
import bellLight from '../../assets/bellLight.png'
import sun from '../../assets/sun.png'
import sunLight from '../../assets/sunLight.png'

const Header = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const [theme, setTheme] = useState("light");
    
        // Load theme from localStorage if available
        useEffect(() => {
            const savedTheme = localStorage.getItem("theme");
            if (savedTheme) {
            setTheme(savedTheme);
            }
        }, []);
        // Apply theme to body
        useEffect(() => {
            document.body.className = theme;
            localStorage.setItem("theme", theme);
        }, [theme]);
    
        // Toggle function
        const toggleTheme = () => {
            setTheme(theme === "light" ? "dark" : "light");
        };


    function logout() {
        localStorage.removeItem('user');
        navigate("/"); 
    }
  return (
    <div className="header">
        <div className="logo-section">
            <div className="logo"></div>
            <h2 className="app-title">AI-Assisted python project  </h2>
        </div>

        <div className="header-actions">
            <button className="share-btn">Share Link</button>
                <div className="header-icons">
                    <button className="icon-btn refreshBtn" title="Refresh" onClick={() => navigate(0)}>
                        <img src={theme === "light" ? refresh : refreshLight  } alt="" />
                    </button>
                    <button className="icon-btn" title="Help">
                        <img src={theme === "light" ? question : questionLight  } alt="" />
                    </button>
                    <button className="icon-btn" title="Notifications">
                        <img src={theme === "light" ? bell : bellLight  } alt="" />
                    </button>
                    <button className="icon-btn" title="Theme">
                        <img src={theme === "light" ? sun : sunLight  } onClick={toggleTheme} alt="" />
                    </button>
                    <div className="profile-container" >
                        <a className="profile-pic nav-link dropdown-toggle" 
                            href="#"
                            id="navbarScrollingDropdown"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        > {user ? user.charAt(0).toUpperCase() : "?"}</a>
                        
                        <ul className="profile-dropdown dropdown-menu" id="profileDropdown" aria-labelledby="navbarScrollingDropdown">
                            <div className="dropdown-item" >
                                <div className="userProf"></div>
                                Profile Details
                            </div>
                            <div className="dropdown-item" onClick={logout}>
                                <div className="logout-icon"></div>
                                Logout
                            </div>
                        </ul>
                    </div>
                    
            </div>
        </div>
    </div>
  )
}

export default Header
