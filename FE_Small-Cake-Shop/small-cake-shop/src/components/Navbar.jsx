import { Link, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiUser, FiLogOut } from 'react-icons/fi'
import { MdOutlineCake } from 'react-icons/md'

export default function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-pink-500 font-bold text-xl">
          <MdOutlineCake size={26} />
          Small Cake Shop
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-4">
          {!token ? (
            <>
              <Link to="/login" className="text-gray-600 hover:text-pink-500 text-sm font-medium">Login</Link>
              <Link to="/register" className="bg-pink-500 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-pink-600">Daftar</Link>
            </>
          ) : (
            <>
              {role === 'admin' ? (
                <>
                  <Link to="/admin" className="text-gray-600 hover:text-pink-500 text-sm font-medium">Dashboard</Link>
                  <Link to="/admin/products" className="text-gray-600 hover:text-pink-500 text-sm font-medium">Produk</Link>
                  <Link to="/admin/orders" className="text-gray-600 hover:text-pink-500 text-sm font-medium">Order</Link>
                </>
              ) : (
                <>
                  <Link to="/" className="text-gray-600 hover:text-pink-500 text-sm font-medium">Produk</Link>
                  <Link to="/cart" className="text-gray-600 hover:text-pink-500 text-sm font-medium flex items-center gap-1">
                    <FiShoppingCart /> Keranjang
                  </Link>
                  <Link to="/orders" className="text-gray-600 hover:text-pink-500 text-sm font-medium flex items-center gap-1">
                    <FiUser /> Pesanan
                  </Link>
                </>
              )}
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 flex items-center gap-1 text-sm">
                <FiLogOut /> Keluar
              </button>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}