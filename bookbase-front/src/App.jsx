import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import LoginPage from './Pages/LoginPage/LoginPage'

function App() {

  return (
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </Router>
  )
}

export default App
