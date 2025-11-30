import { useNavigate } from "react-router-dom";
import { useState,useEffect } from "react";
import Header from "../Header/Header";
import Drawing from "../Drawing/Drawing";

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();
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
    <div className="container-dashboard">
        <Header />
        <div className="main-content">
            <Drawing theme={theme} />
        </div>
        
    </div>
  )
}

export default Dashboard
