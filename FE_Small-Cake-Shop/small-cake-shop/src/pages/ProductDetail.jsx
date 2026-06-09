import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProductById, addToCart } from '../services/api'
import { MdOutlineCake } from 'react-icons/md'
import { FiShoppingCart, FiArrowLeft } from 'react-icons/fi'

export default function ProductDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const token        = localStorage.getItem('token')
  const role         = localStorage.getItem('role')

  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading]   = useState(true)
  const [adding, setAdding]     = useState(false)
  const [message, setMessage]   = useState({ type: '', text: '' })

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const res = await getProductById(id)
      setProduct(res.data.data)
    } catch {
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!token) return navigate('/login')
    if (role === 'admin') return

    setAdding(true)
    setMessage({ type: '', text: '' })
    try {
      await addToCart({ product_id: product.id, quantity })
      setMessage({ type: 'success', text: 'Produk berhasil ditambahkan ke keranjang!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal menambahkan ke keranjang' })
    } finally {
      setAdding(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-400 border-t-transparent"></div>
    </div>
  )

  if (!product) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Tombol Kembali */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-pink-500 text-sm mb-6 transition"
      >
        <FiArrowLeft /> Kembali
      </button>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden md:flex">

        {/* Gambar */}
        <div className="md:w-1/2 h-72 md:h-auto bg-pink-50 flex items-center justify-center">
          {product.image ? (
            <img
              src={`http://localhost:3000/uploads/${product.image}`}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <MdOutlineCake size={80} className="text-pink-200" />
          )}
        </div>

        {/* Info */}
        <div className="md:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <p className="text-3xl font-bold text-pink-500 mb-4">
              Rp {Number(product.price).toLocaleString('id-ID')}
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              {product.description || 'Tidak ada deskripsi tersedia.'}
            </p>
            {product.stock !== null && (
              <p className="text-sm text-gray-400">
                Stok: <span className="font-medium text-gray-600">{product.stock}</span>
              </p>
            )}
          </div>

          {/* Aksi — hanya tampil untuk user biasa */}
          {role !== 'admin' && (
            <div className="mt-6">

              {/* Notifikasi */}
              {message.text && (
                <div className={`text-sm px-4 py-2 rounded-lg mb-4 border ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-600 border-green-200'
                    : 'bg-red-50 text-red-500 border-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-gray-600 font-medium">Jumlah:</span>
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 text-lg font-medium transition"
                  >
                    −
                  </button>
                  <span className="px-4 py-1.5 text-sm font-semibold border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 text-lg font-medium transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Tombol */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="flex-1 flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2.5 rounded-xl text-sm transition disabled:opacity-60"
                >
                  <FiShoppingCart />
                  {adding ? 'Menambahkan...' : 'Tambah ke Keranjang'}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}