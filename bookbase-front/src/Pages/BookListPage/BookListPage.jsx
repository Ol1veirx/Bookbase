import { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { CiSearch } from "react-icons/ci";
import "./BookListPage.css";

function BookListPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://localhost:8002"

  const fetchBooks = async (query = "") => {
    try {
      setLoading(true);
      setError(null);

      let url = `${API_BASE_URL}/livros`;

      if (query.trim()) {
        url += `?busca=${encodeURIComponent(query)}`;
      }

      const response = await fetch(url);

      console.log("Status da resposta:", response.status);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Dados recebidos:", data);

      setBooks(data);
    } catch (err) {
      setError(err.message);
      console.error("Erro completo:", err);
    } finally {
      setLoading(false);
    }
  };

  // Buscar livros quando o componente carregar
  useEffect(() => {
    fetchBooks();
  }, []);

  // Função para lidar com a pesquisa
  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks(searchTerm);
  };

  return (
    <div className="book-list-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Biblioteca de Livros</h1>
          <p>Explore nossa coleção de livros</p>
        </div>

        <div className="listsearchbooks-content">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-container">
              <input
                type="text"
                placeholder="Pesquisar por título, autor ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                <CiSearch />
                Buscar
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
                <button
                  onClick={() => fetchBooks(searchTerm)}
                  className="retry-btn"
                >
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
                      src={
                        book.capa
                          ? `${API_BASE_URL}/livros/capas/${book.capa}`
                          : "https://via.placeholder.com/128x200?text=Sem+Imagem"
                      }
                      alt={book.titulo || "Livro"}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/128x200?text=Sem+Imagem";
                      }}
                    />
                  </div>
                  <div className="book-info">
                    <h3 className="book-title">
                      {book.titulo || "Título não disponível"}
                    </h3>
                    <p className="book-authors">
                      {book.autor || "Autor desconhecido"}
                    </p>
                    <p className="book-category">
                      {book.categoria || "Categoria não informada"}
                    </p>
                    <p className="book-year">
                      Publicado em: {book.ano || "Data não informada"}
                    </p>
                    <p className="book-pages">
                      Páginas: {book.paginas || "Não informado"}
                    </p>
                    <p className="book-description">
                      {book.descricao?.trim() || "Descrição não disponível"}
                    </p>
                    <p className="book-copies">
                      Exemplares disponíveis: <strong>{book.quantidade_exemplares}</strong>
                    </p>
                    <div className="book-actions">
                      <button className="btn-details">Ver Detalhes</button>
                      <button
                        className="btn-add"
                        disabled={book.quantidade_exemplares === 0}
                      >
                        {book.quantidade_exemplares > 0 ? "Adicionar à Lista" : "Indisponível"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {books.length === 0 && !loading && !error && (
              <div className="no-books">
                <p>
                  {searchTerm
                    ? `Nenhum livro encontrado para "${searchTerm}"`
                    : "Nenhum livro disponível"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default BookListPage;
