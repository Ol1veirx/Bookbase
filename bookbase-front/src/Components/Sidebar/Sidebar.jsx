import { Link, useLocation } from 'react-router-dom'

import { TbBooks } from "react-icons/tb";
import { PiBooksThin } from "react-icons/pi";
import { TiUserAddOutline } from "react-icons/ti";
import { CiSettings } from "react-icons/ci";
import { IoMdExit } from "react-icons/io";

import './Sidebar.css'

function Sidebar() {
   const location = useLocation()

   const menuItems = [
      { path: '/books', label: 'Livros', icon: <TbBooks /> },
      { path: '/register-book', label: 'Cadastrar Livro', icon: <PiBooksThin /> },
      { path: '/categories', label: 'Registrar Empréstimo', icon: <TiUserAddOutline /> },
      { path: '/settings', label: 'Configurações', icon: <CiSettings /> }
   ]

   const handleLogout = () => {
      console.log('Logout realizado')
   }

   return (
      <aside className="sidebar">
         <div className="sidebar-header">
            <h1 className="platform-name">BOOKBASE</h1>
         </div>

         <nav className="sidebar-nav">
            <ul className="menu-list">
               {menuItems.map((item) => (
                  <li key={item.path} className="menu-item">
                     <Link
                        to={item.path}
                        className={`menu-link ${location.pathname === item.path ? 'active' : ''}`}
                     >
                        <span className="menu-icon">{item.icon}</span>
                        <span className="menu-label">{item.label}</span>
                     </Link>
                  </li>
               ))}
            </ul>
         </nav>

         <div className="sidebar-footer">
            <button onClick={handleLogout} className="logout-btn">
               <IoMdExit />
               <span className="menu-label">Sair</span>
            </button>
         </div>
      </aside>
   )
}

export default Sidebar