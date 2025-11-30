import './App.css'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Home from './Components/Home/Home'
import Login from './Components/Login/Login'
import Register from './Components/Register/Register'
import Dashboard from './Components/Dashboard/Dashboard'
function App() {

  return (
   <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          
        </Routes>
      </BrowserRouter>
    </div>
   
  )
}

export default App
