import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import LoginPage from './Pages/LoginPage/LoginPage'
import BookListPage from './Pages/BookListPage/BookListPage'
import RegisterBookPage from './Pages/RegisterBookPage/RegisterBookPage'

function App() {

  return (
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/books" element={<BookListPage />}/>
          <Route path='/register-book' element={<RegisterBookPage />} />
        </Routes>
      </Router>
  )
}

export default App
