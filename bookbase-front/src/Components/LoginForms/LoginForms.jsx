import { useState } from 'react'
import './LoginForms.css'
import { useNavigate } from 'react-router-dom'

function LoginForms() {

   const navigate = useNavigate()

   const [formData, setFormData] = useState({
      email: '',
      password: ''
   })

   const [loading, setLoading] = useState(false)
   const [error, setError] = useState('')

   const handleInputChange = (e) => {
      const { name, value } = e.target
      setFormData(prev => ({
         ...prev,
         [name]: value
      }))
   }

   const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)
      setError('')

      try {
         console.log('Login attempt:', formData)

         const response = await fetch("http://localhost:8002/auth/login-json", {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               email: formData.email,
               password: formData.password
            })
         })

         console.log('Status:', response.status)

         if (response.ok) {
            const data = await response.json()

            localStorage.setItem('token', data.access_token)

            setFormData({
               email: '',
               password: ''
            })

            navigate("/books")
         } else {
            const errorData = await response.json()
            console.error('Erro do servidor:', errorData)
            setError(errorData.detail || 'Erro ao fazer login')
         }
      } catch (error) {
         console.error('Erro na requisição:', error)
         setError('Erro ao conectar com o servidor')
      } finally {
         setLoading(false)
      }
   }

   return (
      <div className='loginforms-content'>
         <div className='login-header'>
            <h2>Iniciar sessão</h2>
            <p>Entre na sua conta para continuar</p>
         </div>

         {error && (
            <div className="error-message">
               {error}
            </div>
         )}

         <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
               <input
                  id="email"
                  name="email"
                  type='email'
                  placeholder='seuemail@hotmail.com'
                  className='login-input'
                  value={formData.email}
                  onChange={handleInputChange}
                  required
               />
            </div>

            <div className="input-group">
               <input
                  id="password"
                  name="password"
                  type='password'
                  placeholder='Sua senha'
                  className='login-input'
                  value={formData.password}
                  onChange={handleInputChange}
                  required
               />
            </div>

            <div className="form-actions">
               <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
               >
                  {loading ? 'Entrando...' : 'Entrar'}
               </button>
            </div>
         </form>
      </div>
   )
}

export default LoginForms
