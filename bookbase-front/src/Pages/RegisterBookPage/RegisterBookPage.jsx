import { useState } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./RegisterBookPage.css";

function RegisterBookPage() {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    description: "",
    category: "",
    publishYear: "",
    pages: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:8000/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage("Livro registrado com sucesso!");
        setFormData({
          title: "",
          author: "",
          isbn: "",
          description: "",
          category: "",
          publishYear: "",
          pages: "",
        });
      } else {
        setMessage("Erro ao registrar o livro. Tente novamente.");
      }
    } catch (error) {
      setMessage("Erro ao conectar com o servidor.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-register-layout">
      <Sidebar />
      <main className="main-content">
        <div className="register-container">
          <h1>Registrar Novo Livro</h1>

          {message && <div className="message">{message}</div>}

          <form onSubmit={handleSubmit} className="book-form">
            <div className="form-group">
              <label htmlFor="title">Título *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Digite o título do livro"
              />
            </div>

            <div className="form-group">
              <label htmlFor="author">Autor *</label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                placeholder="Digite o nome do autor"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="isbn">ISBN</label>
                <input
                  type="text"
                  id="isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                  placeholder="Digite o ISBN"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Categoria</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Ex: Ficção, Romance"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="publishYear">Ano de Publicação</label>
                <input
                  type="number"
                  id="publishYear"
                  name="publishYear"
                  value={formData.publishYear}
                  onChange={handleChange}
                  placeholder="2024"
                />
              </div>

              <div className="form-group">
                <label htmlFor="pages">Páginas</label>
                <input
                  type="number"
                  id="pages"
                  name="pages"
                  value={formData.pages}
                  onChange={handleChange}
                  placeholder="300"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Descrição</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Digite uma descrição do livro"
                rows="4"
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Enviando..." : "Registrar Livro"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default RegisterBookPage;