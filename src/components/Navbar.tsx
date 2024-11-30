import { Link } from 'react-router-dom'
import { ShoppingBag, Settings } from 'lucide-react'

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6" />
            <span className="font-semibold text-xl">InstaBazaar</span>
          </Link>
          <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-full">
            <Settings className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar