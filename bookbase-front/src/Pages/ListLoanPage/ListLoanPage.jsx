import { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { CiSearch, CiCalendar, CiUser } from "react-icons/ci";
import { FaBook, FaCheck, FaClock, FaExclamationTriangle } from "react-icons/fa";
import "./ListLoanPage.css";

function ListLoanPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLoans, setTotalLoans] = useState(0);

  const [returnModal, setReturnModal] = useState({
    isOpen: false,
    loanId: null,
    bookTitle: "",
    userName: ""
  });
  const [returning, setReturning] = useState(false);

  const API_BASE_URL = "http://localhost:8002";
  const ITEMS_PER_PAGE = 10;

  const fetchLoans = async (query = "", status = "todos", page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const skip = (page - 1) * ITEMS_PER_PAGE;
      let url = `${API_BASE_URL}/emprestimos?skip=${skip}&limit=${ITEMS_PER_PAGE}`;

      if (query.trim()) {
        url += `&busca=${encodeURIComponent(query)}`;
      }

      if (status !== "todos") {
        url += `&status=${status}`;
      }

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      const loansArray = Array.isArray(data) ? data : data.emprestimos || [];
      const total = data.total || loansArray.length;

      const loansWithDetails = await Promise.all(
        loansArray.map(async (loan) => {
          const [userResponse, bookResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/usuarios/${loan.usuario_id}`, {
              headers: { "Authorization": `Bearer ${token}` }
            }),
            fetch(`${API_BASE_URL}/livros/${loan.livro_id}`)
          ]);

          let user = null;
          let book = null;

          if (userResponse.ok) {
            user = await userResponse.json();
          }

          if (bookResponse.ok) {
            book = await bookResponse.json();
          }

          return {
            ...loan,
            usuario: user,
            livro: book
          };
        })
      );

      setLoans(loansWithDetails);
      setTotalLoans(total);
      setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans("", "todos", 1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLoans(searchTerm, statusFilter, 1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    fetchLoans(searchTerm, status, 1);
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      fetchLoans(searchTerm, statusFilter, page);
    }
  };

  const openReturnModal = (loan) => {
    setReturnModal({
      isOpen: true,
      loanId: loan.id,
      bookTitle: loan.livro?.titulo || `Livro ID: ${loan.livro_id}`,
      userName: loan.usuario?.nome || `Usuário ID: ${loan.usuario_id}`
    });
  };

  const closeReturnModal = () => {
    setReturnModal({
      isOpen: false,
      loanId: null,
      bookTitle: "",
      userName: ""
    });
  };

  const handleReturnBook = async () => {
    if (!returnModal.loanId) return;

    try {
      setReturning(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Token não encontrado. Faça login novamente.");
        closeReturnModal();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/emprestimos/${returnModal.loanId}/devolver`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Status da resposta:", response.status);

      if (response.ok) {
        const updatedLoan = await response.json();
        console.log("Devolução registrada:", updatedLoan);

        setLoans(loans.map(loan =>
          loan.id === returnModal.loanId
            ? { ...loan, ...updatedLoan }
            : loan
        ));

        setError(null);
        closeReturnModal();

      } else {
        const errorData = await response.json();
        console.error("Erro ao registrar devolução:", errorData);
        setError(`Erro ao registrar devolução: ${errorData.detail || "Tente novamente"}`);
      }
    } catch (err) {
      console.error("Erro completo:", err);
      setError("Erro ao conectar com o servidor");
    } finally {
      setReturning(false);
    }
  };

  const isOverdue = (loan) => {
    if (loan.status !== "emprestado") return false;
    const today = new Date();
    const dueDate = new Date(loan.data_devolucao_prevista);
    return today > dueDate;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const getStatusIcon = (loan) => {
    if (loan.status === "devolvido") return <FaCheck className="status-icon success" />;
    if (isOverdue(loan)) return <FaExclamationTriangle className="status-icon danger" />;
    return <FaClock className="status-icon warning" />;
  };

  const getStatusClass = (loan) => {
    if (loan.status === "devolvido") return "devolvido";
    if (isOverdue(loan)) return "atrasado";
    return "emprestado";
  };

  const getStatusText = (loan) => {
    if (loan.status === "devolvido") return "Devolvido";
    if (isOverdue(loan)) return "Atrasado";
    return "Emprestado";
  };

  return (
    <div className="loan-list-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Lista de Empréstimos</h1>
        </div>

        <div className="loan-list-content">
          <div className="filters-section">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Buscar por usuário ou livro..."
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

            <div className="status-filters">
              <button
                className={`filter-btn ${statusFilter === "todos" ? "active" : ""}`}
                onClick={() => handleStatusFilter("todos")}
              >
                Todos
              </button>
              <button
                className={`filter-btn ${statusFilter === "emprestado" ? "active" : ""}`}
                onClick={() => handleStatusFilter("emprestado")}
              >
                Emprestados
              </button>
              <button
                className={`filter-btn ${statusFilter === "devolvido" ? "active" : ""}`}
                onClick={() => handleStatusFilter("devolvido")}
              >
                Devolvidos
              </button>
            </div>
          </div>

          {loading && (
            <div className="loading">
              <p>Carregando empréstimos...</p>
            </div>
          )}

          {error && (
            <div className="error">
              <p>Erro: {error}</p>
              <button
                onClick={() => fetchLoans(searchTerm, statusFilter, currentPage)}
                className="retry-btn"
              >
                Tentar novamente
              </button>
            </div>
          )}

          <div className="loans-container">
            {loans.length > 0 ? (
              loans.map((loan) => (
                <div key={loan.id} className={`loan-card ${getStatusClass(loan)}`}>
                  <div className="loan-header">
                    <div className="loan-status">
                      {getStatusIcon(loan)}
                      <span className="status-text">{getStatusText(loan)}</span>
                    </div>
                    <div className="loan-id">#{loan.id}</div>
                  </div>

                  <div className="loan-details">
                    <div className="loan-info">
                      <div className="info-item">
                        <CiUser className="info-icon" />
                        <div>
                          <label>Usuário:</label>
                          <span>
                            { loan.usuario_nome }
                          </span>
                        </div>
                      </div>

                      <div className="info-item">
                        <FaBook className="info-icon" />
                        <div>
                          <label>Livro:</label>
                          <span>
                            {loan.livro ?
                              `${loan.livro.titulo} - ${loan.livro.autor}` :
                              `ID: ${loan.livro_id}`
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="loan-dates">
                      <div className="date-item">
                        <label>Data do Empréstimo:</label>
                        <span>{formatDate(loan.data_emprestimo)}</span>
                      </div>

                      <div className="date-item">
                        <label>Devolução Prevista:</label>
                        <span className={isOverdue(loan) ? "overdue" : ""}>
                          {formatDate(loan.data_devolucao_prevista)}
                        </span>
                      </div>

                      {loan.data_devolucao_real && (
                        <div className="date-item">
                          <label>Data de Devolução:</label>
                          <span>{formatDate(loan.data_devolucao_real)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {loan.status === "emprestado" && (
                    <div className="loan-actions">
                      <button
                        className="btn-return"
                        onClick={() => openReturnModal(loan)}
                      >
                        Registrar Devolução
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              !loading && (
                <div className="no-loans">
                  <p>
                    {searchTerm || statusFilter !== "todos"
                      ? "Nenhum empréstimo encontrado com os filtros aplicados"
                      : "Nenhum empréstimo registrado"}
                  </p>
                </div>
              )
            )}
          </div>

          {totalPages > 1 && (
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
                {totalLoans > 0 && (
                  <span>({totalLoans} empréstimos no total)</span>
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
      </main>

      {returnModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmar Devolução</h2>
            <p>
              Você tem certeza que deseja registrar a devolução do livro{" "}
              <strong>"{returnModal.bookTitle}"</strong> do usuário{" "}
              <strong>{returnModal.userName}</strong>?
            </p>
            <p className="modal-info">
              A data de devolução será registrada como hoje ({new Date().toLocaleDateString("pt-BR")}).
            </p>

            <div className="modal-actions">
              <button
                className="modal-btn modal-btn-cancel"
                onClick={closeReturnModal}
                disabled={returning}
              >
                Cancelar
              </button>
              <button
                className="modal-btn modal-btn-confirm"
                onClick={handleReturnBook}
                disabled={returning}
              >
                {returning ? "Processando..." : "Confirmar Devolução"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListLoanPage;
