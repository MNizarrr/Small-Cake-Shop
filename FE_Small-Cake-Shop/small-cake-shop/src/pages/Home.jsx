import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/api";
import { MdOutlineCake } from "react-icons/md";
import { FiShoppingCart } from "react-icons/fi";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts(page, 8);
      setProducts(res.data.data.data);
      setPagination(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-400 rounded-2xl p-8 mb-10 text-white flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Kue Lezat untuk Setiap Momen
          </h1>
          <p className="text-pink-100 mb-4">
            Pesan kue favoritmu sekarang, diantarkan langsung ke pintu rumahmu.
          </p>
          <a
            href="#produk"
            className="bg-white text-pink-500 font-semibold px-5 py-2 rounded-full text-sm hover:bg-pink-50 transition"
          >
            Lihat Produk
          </a>
        </div>
        <MdOutlineCake size={100} className="text-pink-200 hidden md:block" />
      </div>

      {/* Produk */}
      <div id="produk">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Semua Produk</h2>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-400 border-t-transparent"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            Belum ada produk tersedia.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden group"
              >
                {/* Gambar */}
                <div className="relative overflow-hidden h-44 bg-pink-50">
                  {product.image ? (
                    <img
                      src={`http://localhost:3000/uploads/${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MdOutlineCake size={48} className="text-pink-200" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">
                    {product.name}
                  </h3>
                  <p className="text-pink-500 font-bold text-sm mb-3">
                    Rp {Number(product.price).toLocaleString("id-ID")}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      to={`/products/${product.id}`}
                      className="flex-1 text-center border border-pink-400 text-pink-500 text-xs font-medium py-1.5 rounded-lg hover:bg-pink-50 transition"
                    >
                      Detail
                    </Link>
                    <Link
                      to={`/products/${product.id}`}
                      className="flex-1 flex items-center justify-center gap-1 bg-pink-500 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-pink-600 transition"
                    >
                      <FiShoppingCart size={12} /> Beli
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPage > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>

            {Array.from({ length: pagination.totalPage }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                    page === p
                      ? "bg-pink-500 text-white"
                      : "border text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ),
            )}

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === pagination.totalPage}
              className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Berikutnya
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
