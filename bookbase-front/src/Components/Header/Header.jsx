import './Header.css'

function Header() {

   return (
      <header>
         <div>
            <h1>BOOKBASE</h1>
         </div>

         <nav>
            <ul>
               <li>Contate-nos</li>
               <li className='btn-login'>Iniciar Sessão</li>
               <li className='btn-register'>Cadastre-se</li>
            </ul>
         </nav>
      </ header>
   )
}

export default Header
