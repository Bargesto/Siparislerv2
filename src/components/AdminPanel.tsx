import { useState, useEffect } from 'react'
import { Product, Order } from '../types'
import { Download, Plus, Trash, Edit } from 'lucide-react'
import * as XLSX from 'xlsx'

const AdminPanel = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Product>({
    id: '',
    name: '',
    image: '',
    price: 0,
    sizes: [{ name: '', stock: 0 }]
  })

  useEffect(() => {
    const storedProducts = localStorage.getItem('products')
    const storedOrders = localStorage.getItem('orders')
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts))
    }
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders))
    }
  }, [])

  const getOrderCountForProduct = (productId: string) => {
    return orders.filter(order => order.productId === productId).length
  }

  const handleAddSize = () => {
    const targetProduct = editingProduct || newProduct
    const updatedProduct = {
      ...targetProduct,
      sizes: [...targetProduct.sizes, { name: '', stock: 0 }]
    }
    if (editingProduct) {
      setEditingProduct(updatedProduct)
    } else {
      setNewProduct(updatedProduct)
    }
  }

  const handleRemoveSize = (index: number) => {
    const targetProduct = editingProduct || newProduct
    const updatedProduct = {
      ...targetProduct,
      sizes: targetProduct.sizes.filter((_, i) => i !== index)
    }
    if (editingProduct) {
      setEditingProduct(updatedProduct)
    } else {
      setNewProduct(updatedProduct)
    }
  }

  const handleSizeChange = (index: number, field: 'name' | 'stock', value: string | number) => {
    const targetProduct = editingProduct || newProduct
    const updatedSizes = targetProduct.sizes.map((size, i) => {
      if (i === index) {
        return { ...size, [field]: value }
      }
      return size
    })
    if (editingProduct) {
      setEditingProduct({ ...targetProduct, sizes: updatedSizes })
    } else {
      setNewProduct({ ...targetProduct, sizes: updatedSizes })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let updatedProducts

    if (editingProduct) {
      updatedProducts = products.map(p => 
        p.id === editingProduct.id ? editingProduct : p
      )
    } else {
      const productToSave = {
        ...newProduct,
        id: Date.now().toString()
      }
      updatedProducts = [...products, productToSave]
    }

    localStorage.setItem('products', JSON.stringify(updatedProducts))
    setProducts(updatedProducts)
    setEditingProduct(null)
    setNewProduct({
      id: '',
      name: '',
      image: '',
      price: 0,
      sizes: [{ name: '', stock: 0 }]
    })
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setNewProduct({
      id: '',
      name: '',
      image: '',
      price: 0,
      sizes: [{ name: '', stock: 0 }]
    })
  }

  const handleDelete = (productId: string) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      const updatedProducts = products.filter(p => p.id !== productId)
      localStorage.setItem('products', JSON.stringify(updatedProducts))
      setProducts(updatedProducts)
    }
  }

  const exportOrders = () => {
    const allOrders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]')
    const ws = XLSX.utils.json_to_sheet(allOrders)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Siparişler')
    XLSX.writeFile(wb, 'tum-siparisler.xlsx')
  }

  const exportProductOrders = (productId: string, productName: string) => {
    const productOrders = orders.filter(order => order.productId === productId)
    const ws = XLSX.utils.json_to_sheet(productOrders)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Ürün Siparişleri')
    XLSX.writeFile(wb, `${productName}-siparisleri.xlsx`)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <button
          onClick={exportOrders}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Download size={20} />
          Tüm Siparişleri İndir
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ürün Adı
            </label>
            <input
              type="text"
              value={editingProduct?.name || newProduct.name}
              onChange={(e) => editingProduct 
                ? setEditingProduct({ ...editingProduct, name: e.target.value })
                : setNewProduct({ ...newProduct, name: e.target.value })
              }
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Görsel URL
            </label>
            <input
              type="url"
              value={editingProduct?.image || newProduct.image}
              onChange={(e) => editingProduct
                ? setEditingProduct({ ...editingProduct, image: e.target.value })
                : setNewProduct({ ...newProduct, image: e.target.value })
              }
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fiyat
            </label>
            <input
              type="number"
              value={editingProduct?.price || newProduct.price}
              onChange={(e) => editingProduct
                ? setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                : setNewProduct({ ...newProduct, price: Number(e.target.value) })
              }
              className="w-full border rounded-lg p-2"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bedenler ve Stok
            </label>
            {(editingProduct?.sizes || newProduct.sizes).map((size, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={size.name}
                  onChange={(e) => handleSizeChange(index, 'name', e.target.value)}
                  placeholder="Beden"
                  className="flex-1 border rounded-lg p-2"
                  required
                />
                <input
                  type="number"
                  value={size.stock}
                  onChange={(e) => handleSizeChange(index, 'stock', Number(e.target.value))}
                  placeholder="Stok"
                  className="flex-1 border rounded-lg p-2"
                  required
                  min="0"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSize(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddSize}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Plus size={20} />
              Beden Ekle
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              {editingProduct ? 'Güncelle' : 'Ürünü Kaydet'}
            </button>
            {editingProduct && (
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                İptal
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Mevcut Ürünler</h2>
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-gray-600">{product.price.toLocaleString('tr-TR')} ₺</p>
                  <p className="text-sm text-blue-600 mt-1">
                    Toplam Sipariş: {getOrderCountForProduct(product.id)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => exportProductOrders(product.id, product.name)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    title="Ürün siparişlerini indir"
                  >
                    <Download size={20} />
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash size={20} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <span 
                    key={size.name}
                    className="text-sm bg-gray-100 px-2 py-1 rounded"
                  >
                    {size.name} ({size.stock})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel