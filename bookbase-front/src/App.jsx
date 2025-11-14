import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import LoginPage from './Pages/LoginPage/LoginPage'
import BookListPage from './Pages/BookListPage/BookListPage'
import RegisterBookPage from './Pages/RegisterBookPage/RegisterBookPage'
import LoanBookPage from './Pages/LoanBookPage/LoanBookPage'
import ListLoanPage from './Pages/ListLoanPage/ListLoanPage'

function App() {

  return (
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/books" element={<BookListPage />}/>
          <Route path='/register-book' element={<RegisterBookPage />} />
          <Route path='/loan-book' element={<LoanBookPage />} />
          <Route path='/list-loan' element={<ListLoanPage /> } />
        </Routes>
      </Router>
  )
}

export default App
