import { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { CiSearch } from "react-icons/ci";
import "./BookListPage.css";

function BookListPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, bookId: null, bookTitle: "" });
  const [deleting, setDeleting] = useState(false);

  const API_BASE_URL = "http://localhost:8002";
  const ITEMS_PER_PAGE = 10;

  const fetchBooks = async (query = "", page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const skip = (page - 1) * ITEMS_PER_PAGE;
      let url = `${API_BASE_URL}/livros?skip=${skip}&limit=${ITEMS_PER_PAGE}`;

      if (query.trim()) {
        url += `&busca=${encodeURIComponent(query)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      const booksArray = data.livros || [];
      const total = data.total || 0;

      setBooks(booksArray);
      setTotalBooks(total);
      setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks("", 1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks(searchTerm, 1);
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      fetchBooks(searchTerm, page);
    }
  };

  const openDeleteModal = (bookId, bookTitle) => {
    setDeleteModal({ isOpen: true, bookId, bookTitle });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, bookId: null, bookTitle: "" });
  };

  const handleDeleteBook = async () => {
    if (!deleteModal.bookId) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Token não encontrado. Faça login novamente.");
        closeDeleteModal();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/livros/${deleteModal.bookId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log("Status da resposta:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Livro deletado:", data);

        setBooks(books.filter(book => book.id !== deleteModal.bookId));
        setTotalBooks(totalBooks - 1);

        if (books.length === 1 && currentPage > 1) {
          fetchBooks(searchTerm, currentPage - 1);
        } else {
          setTotalPages(Math.ceil((totalBooks - 1) / ITEMS_PER_PAGE));
        }

        setError(null);
        closeDeleteModal();
      } else {
        const errorData = await response.json();
        console.error("Erro ao deletar:", errorData);
        setError(`Erro ao deletar: ${errorData.detail || "Tente novamente"}`);
      }
    } catch (err) {
      console.error("Erro completo:", err);
      setError("Erro ao deletar livro");
    } finally {
      setDeleting(false);
    }
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

            {error && (
              <div className="error">
                <p>Erro: {error}</p>
                <button
                  onClick={() => fetchBooks(searchTerm, currentPage)}
                  className="retry-btn"
                >
                  Tentar novamente
                </button>
              </div>
            )}

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
                      <button className="btn-update">Atualizar</button>
                      <button
                        className="btn-delete"
                        onClick={() => openDeleteModal(book.id, book.titulo)}
                      >
                        Excluir
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

            {totalPages > 0 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ← Anterior
                </button>

                <div className="pagination-info">
                  Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                  {totalBooks > 0 && (
                    <span> ({totalBooks} livros no total)</span>
                  )}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próxima →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {deleteModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmar Exclusão</h2>
            <p>
              Você tem certeza que deseja excluir o livro <strong>"{deleteModal.bookTitle}"</strong>?
            </p>
            <p className="modal-warning">Esta ação não pode ser desfeita.</p>

            <div className="modal-actions">
              <button
                className="modal-btn modal-btn-cancel"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                className="modal-btn modal-btn-delete"
                onClick={handleDeleteBook}
                disabled={deleting}
              >
                {deleting ? "Deletando..." : "Deletar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookListPage;
