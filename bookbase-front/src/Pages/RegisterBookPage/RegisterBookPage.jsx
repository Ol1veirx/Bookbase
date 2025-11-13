import { useState } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { FaImages } from "react-icons/fa";
import "./RegisterBookPage.css";

function RegisterBookPage() {
  const [formData, setFormData] = useState({
    titulo: "",
    autor: "",
    isbn: "",
    descricao: "",
    categoria: "",
    quantidade_exemplares: "",
    ano: "",
    paginas: "",
    capa: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const API_BASE_URL = "http://localhost:8002";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        capa: file,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("autor", formData.autor);
      formDataToSend.append("isbn", formData.isbn);
      formDataToSend.append("descricao", formData.descricao);
      formDataToSend.append("categoria", formData.categoria);
      formDataToSend.append("ano", formData.ano);
      formDataToSend.append("paginas", formData.paginas);
      formDataToSend.append("quantidade_exemplares", formData.quantidade_exemplares);

      if (formData.capa) {
        formDataToSend.append("capa", formData.capa);
      }


      console.log("Enviando FormData:", formDataToSend);

      const token = localStorage.getItem('token')
      console.log(token)

      const response = await fetch(`${API_BASE_URL}/livros`, {
        method: "POST",
        body: formDataToSend,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);

      console.log("Status da resposta:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Resposta do servidor:", data);

        setMessageType("success");
        setMessage("✅ Livro registrado com sucesso!");

        setFormData({
          titulo: "",
          autor: "",
          isbn: "",
          descricao: "",
          categoria: "",
          quantidade_exemplares: "",
          ano: "",
          paginas: "",
          capa: null,
        });

        const fileInput = document.getElementById("capa");
        if (fileInput) fileInput.value = "";
      } else {
        const errorData = await response.json();
        setMessageType("error");
        setMessage(`Erro ao registrar o livro: ${errorData.message || "Tente novamente."}`);
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Erro ao conectar com o servidor.");
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

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="book-form">
            <div className="form-group">
              <label htmlFor="titulo">Título *</label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                required
                placeholder="Digite o título do livro"
              />
            </div>

            <div className="form-group">
              <label htmlFor="autor">Autor *</label>
              <input
                type="text"
                id="autor"
                name="autor"
                value={formData.autor}
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
                <label htmlFor="categoria">Categoria</label>
                <input
                  type="text"
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  placeholder="Ex: Ficção, Romance"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ano">Ano de Publicação</label>
                <input
                  type="number"
                  id="ano"
                  name="ano"
                  value={formData.ano}
                  onChange={handleChange}
                  placeholder="2024"
                />
              </div>

              <div className="form-group">
                <label htmlFor="paginas">Páginas</label>
                <input
                  type="number"
                  id="paginas"
                  name="paginas"
                  value={formData.paginas}
                  onChange={handleChange}
                  placeholder="300"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="quantidade_exemplares">Quantidade de Exemplares</label>
              <input
                type="number"
                id="quantidade_exemplares"
                name="quantidade_exemplares"
                value={formData.quantidade_exemplares}
                onChange={handleChange}
                placeholder="30"
              />
            </div>

            <div className="form-group">
              <label htmlFor="descricao">Descrição</label>
              <textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Digite uma descrição do livro"
                rows="4"
              />
            </div>

            <div className="form-group capa-full-width">
              <label htmlFor="capa">Capa do Livro</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="capa"
                  name="capa"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor="capa" className="file-input-label">
                  {formData.capa ? (
                    <>
                      <FaImages /> {formData.capa.name}
                    </>
                  ) : (
                    "Selecionar imagem"
                  )}
                </label>
              </div>
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
