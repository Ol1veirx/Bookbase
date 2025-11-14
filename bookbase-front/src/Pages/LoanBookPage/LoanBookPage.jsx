import { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { CiSearch, CiUser, CiCalendar } from "react-icons/ci";
import { FaBook } from "react-icons/fa";
import "./LoanBookPage.css";

function LoanBookPage() {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [formData, setFormData] = useState({
    usuario_id: "",
    livro_id: "",
    data_devolucao_prevista: ""
  });

  // Estados para busca
  const [userSearch, setUserSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showBookDropdown, setShowBookDropdown] = useState(false);

  const API_BASE_URL = "http://localhost:8002";

  // Buscar usuários
  const fetchUsers = async (search = "") => {
    try {
      const token = localStorage.getItem("token");
      let url = `${API_BASE_URL}/auth/users`;

      if (search.trim()) {
        url += `?busca=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.usuarios || data || []);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  // Buscar livros disponíveis
  const fetchBooks = async (search = "") => {
    try {
      let url = `${API_BASE_URL}/livros?limit=50`;

      if (search.trim()) {
        url += `&busca=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const availableBooks = (data.livros || data || []).filter(
          book => book.quantidade_exemplares > 0
        );
        setBooks(availableBooks);
      }
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchBooks();
  }, []);

  // Filtrar usuários conforme busca
  const filteredUsers = users.filter(user =>
    user.nome?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Filtrar livros conforme busca
  const filteredBooks = books.filter(book =>
    book.titulo?.toLowerCase().includes(bookSearch.toLowerCase()) ||
    book.autor?.toLowerCase().includes(bookSearch.toLowerCase())
  );

  // Selecionar usuário
  const selectUser = (user) => {
    setFormData(prev => ({ ...prev, usuario_id: user.id }));
    setUserSearch(`${user.nome} (${user.email})`);
    setShowUserDropdown(false);
  };

  // Selecionar livro
  const selectBook = (book) => {
    setFormData(prev => ({ ...prev, livro_id: book.id }));
    setBookSearch(`${book.titulo} - ${book.autor}`);
    setShowBookDropdown(false);
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submeter empréstimo
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessageType("error");
        setMessage("❌ Token não encontrado. Faça login novamente.");
        return;
      }

      if (!formData.usuario_id || !formData.livro_id || !formData.data_devolucao_prevista) {
        setMessageType("error");
        setMessage("❌ Por favor, preencha todos os campos.");
        return;
      }

      // Converter data para ISO string
      const dataFormatada = new Date(formData.data_devolucao_prevista).toISOString();

      const requestBody = {
        usuario_id: parseInt(formData.usuario_id),
        livro_id: parseInt(formData.livro_id),
        data_devolucao_prevista: dataFormatada
      };

      console.log("Enviando empréstimo:", requestBody);

      const response = await fetch(`${API_BASE_URL}/emprestimos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log("Status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Empréstimo criado:", data);

        setMessageType("success");
        setMessage("✅ Empréstimo registrado com sucesso!");

        // Limpar formulário
        setFormData({
          usuario_id: "",
          livro_id: "",
          data_devolucao_prevista: ""
        });
        setUserSearch("");
        setBookSearch("");

        // Recarregar livros para atualizar disponibilidade
        fetchBooks();
      } else {
        const errorData = await response.json();
        console.error("Erro do servidor:", errorData);
        setMessageType("error");
        setMessage(`❌ ${errorData.detail || "Erro ao registrar empréstimo"}`);
      }
    } catch (error) {
      console.error("Erro:", error);
      setMessageType("error");
      setMessage("❌ Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Data mínima (hoje)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="loan-book-layout">
      <Sidebar />
      <main className="main-content">
        <div className="loan-container">
          <h1>Emprestar Livro</h1>
          <p className="subtitle">Registre um novo empréstimo de livro</p>

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="loan-form">
            {/* Seleção de Usuário */}
            <div className="form-group">
              <label htmlFor="user-search">
                <CiUser /> Selecionar Usuário *
              </label>
              <div className="search-dropdown">
                <input
                  type="text"
                  id="user-search"
                  placeholder="Buscar usuário por nome ou email..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setShowUserDropdown(true);
                  }}
                  onFocus={() => setShowUserDropdown(true)}
                  className="search-input"
                  required
                />
                {showUserDropdown && (
                  <div className="dropdown-menu">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <div
                          key={user.id}
                          className="dropdown-item"
                          onClick={() => selectUser(user)}
                        >
                          <div className="user-info">
                            <strong>{user.nome}</strong>
                            <span>{user.email}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="dropdown-item disabled">
                        Nenhum usuário encontrado
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Seleção de Livro */}
            <div className="form-group">
              <label htmlFor="book-search">
                <FaBook /> Selecionar Livro *
              </label>
              <div className="search-dropdown">
                <input
                  type="text"
                  id="book-search"
                  placeholder="Buscar livro por título ou autor..."
                  value={bookSearch}
                  onChange={(e) => {
                    setBookSearch(e.target.value);
                    setShowBookDropdown(true);
                  }}
                  onFocus={() => setShowBookDropdown(true)}
                  className="search-input"
                  required
                />
                {showBookDropdown && (
                  <div className="dropdown-menu">
                    {filteredBooks.length > 0 ? (
                      filteredBooks.map(book => (
                        <div
                          key={book.id}
                          className="dropdown-item"
                          onClick={() => selectBook(book)}
                        >
                          <div className="book-info">
                            <strong>{book.titulo}</strong>
                            <span>por {book.autor}</span>
                            <small>Disponíveis: {book.quantidade_exemplares}</small>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="dropdown-item disabled">
                        Nenhum livro disponível
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Data de Devolução */}
            <div className="form-group">
              <label htmlFor="data_devolucao_prevista">
                <CiCalendar /> Data de Devolução Prevista *
              </label>
              <input
                type="date"
                id="data_devolucao_prevista"
                name="data_devolucao_prevista"
                value={formData.data_devolucao_prevista}
                onChange={handleChange}
                min={today}
                required
                className="date-input"
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Registrando..." : "Registrar Empréstimo"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default LoanBookPage;
