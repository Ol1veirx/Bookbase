import { useState, useEffect } from 'react'
import Sidebar from '../../Components/Sidebar/Sidebar'
import './BookListPage.css'

function BookListPage() {
   const [books, setBooks] = useState([])
   const [loading, setLoading] = useState(false)
   const [searchTerm, setSearchTerm] = useState('javascript')
   const [error, setError] = useState(null)

   const fetchBooks = async (query = 'programming') => {
      try {
         setLoading(true)
         setError(null)

         const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`
         console.log('URL da requisição:', url)

         const response = await fetch(url)

         console.log('Status da resposta:', response.status)

         if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`)
         }

         const data = await response.json()
         console.log('Dados recebidos:', data)

         setBooks(data.items || [])
      } catch (err) {
         setError(err.message)
         console.error('Erro completo:', err)
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      fetchBooks(searchTerm)
   }, [])

   const handleSearch = (e) => {
      e.preventDefault()
      if (searchTerm.trim()) {
         fetchBooks(searchTerm.trim())
      }
   }

   return (
      <div className="book-list-layout">
         <Sidebar />
         <main className="main-content">
            <div className="page-header">
               <p>Explore nossa coleção de livros</p>
            </div>

            <div className='listsearchbooks-content'>
               <form onSubmit={handleSearch} className="search-form">
                  <div className="search-container">
                     <input
                        type="text"
                        placeholder="Pesquisar livros..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                     />
                     <button type="submit" className="search-btn">
                        🔍 Buscar
                     </button>
                  </div>
               </form>

               <div>
                  {loading && (
                     <div className="loading">
                        <p>Carregando livros...</p>
                     </div>
                  )}

                  {/* Erro */}
                  {error && (
                     <div className="error">
                        <p>Erro: {error}</p>
                        <button onClick={() => fetchBooks(searchTerm)} className="retry-btn">
                           Tentar novamente
                        </button>
                     </div>
                  )}

                  {/* Lista de livros */}
                  <div className="books-grid">
                     {books.map((book) => (
                        <div key={book.id} className="book-card">
                           <div className="book-image">
                              <img
                                 src={book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x200?text=Sem+Imagem'}
                                 alt={book.volumeInfo.title || 'Livro'}
                                 onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/128x200?text=Sem+Imagem'
                                 }}
                              />
                           </div>
                           <div className="book-info">
                              <h3 className="book-title">
                                 {book.volumeInfo.title || 'Título não disponível'}
                              </h3>
                              <p className="book-authors">
                                 {book.volumeInfo.authors?.join(', ') || 'Autor desconhecido'}
                              </p>
                              <p className="book-published">
                                 Publicado: {book.volumeInfo.publishedDate || 'Data não informada'}
                              </p>
                              <p className="book-description">
                                 {book.volumeInfo.description
                                    ? `${book.volumeInfo.description.slice(0, 150)}...`
                                    : 'Descrição não disponível'
                                 }
                              </p>
                              <div className="book-actions">
                                 <button className="btn-details">Ver Detalhes</button>
                                 <button className="btn-add">Adicionar à Lista</button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>

                  {books.length === 0 && !loading && !error && (
                     <div className="no-books">
                        <p>Nenhum livro encontrado para "{searchTerm}"</p>
                     </div>
                  )}
               </div>
            </div>
         </main>
      </div>
   )
}

export default BookListPage