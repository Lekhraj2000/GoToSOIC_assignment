import {Route,Routes,  Navigate}from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
function App() {
  
  
  return <>
       <Routes>
       <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/" element={ <AdminPanel/>}/>
        <Route path="*" element={<Navigate to="/login" />} />
       </Routes>
  </>
}

export default App
