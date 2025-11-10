import { useState } from 'react'
import './LoginForms.css'
import { useNavigate } from 'react-router-dom'

function LoginForms() {

   const navigate = useNavigate()

   const [formData, setFormData] = useState({
      email: '',
      password: ''
   })

   const handleInputChange = (e) => {
      const { name, value } = e.target
      setFormData(prev => ({
         ...prev,
         [name]: value
      }))
   }

   const handleSubmit = (e) => {
      e.preventDefault()
      console.log('Login attempt:', formData)
      navigate("/books")
   }

   return (
      <div className='loginforms-content'>
         <div className='login-header'>
            <h2>Iniciar sessão</h2>
            <p>Entre na sua conta para continuar</p>
         </div>

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
               <button type="submit" className="btn-submit" onClick={handleSubmit}>
                  Entrar
               </button>
            </div>
         </form>
      </ div>
   )
}

export default LoginForms
