import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../../services/api";
import { MdOutlineCake } from "react-icons/md";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);

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

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteProduct(id);
      setShowConfirm(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Produk</h1>
        <Link
          to="/admin/products/create"
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
        >
          <FiPlus /> Tambah Produk
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-400 border-t-transparent"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <MdOutlineCake size={48} className="text-pink-200 mx-auto mb-4" />
          <p className="text-gray-400">Belum ada produk.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 text-xs border-b">
                  <th className="px-5 py-3 font-medium">Produk</th>
                  <th className="px-5 py-3 font-medium">Harga</th>
                  <th className="px-5 py-3 font-medium">Stok</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b last:border-0 hover:bg-gray-50 transition"
                  >
                    {/* Produk */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-pink-50 flex-shrink-0 flex items-center justify-center">
                          {product.image ? (
                            <img
                              src={`http://localhost:3000/uploads/${product.image}`}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <MdOutlineCake
                              size={20}
                              className="text-pink-200"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                            {product.description || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Harga */}
                    <td className="px-5 py-4 text-gray-700 font-medium">
                      Rp {Number(product.price).toLocaleString("id-ID")}
                    </td>

                    {/* Stok */}
                    <td className="px-5 py-4 text-gray-600">
                      {product.stock ?? "-"}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          product.is_active
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-500"
                        }`}
                      >
                        {product.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
                        >
                          <FiEdit2 size={12} /> Edit
                        </Link>
                        <button
                          onClick={() => setShowConfirm(product)}
                          className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                        >
                          <FiTrash2 size={12} /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPage > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              {Array.from(
                { length: pagination.totalPage },
                (_, i) => i + 1,
              ).map((p) => (
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
              ))}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === pagination.totalPage}
                className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Berikutnya
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Hapus Produk?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Produk{" "}
              <span className="font-semibold text-gray-700">
                "{showConfirm.name}"
              </span>{" "}
              akan dinonaktifkan dan tidak tampil ke pelanggan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 border border-gray-300 text-gray-600 font-medium py-2.5 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(showConfirm.id)}
                disabled={deleting === showConfirm.id}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm transition disabled:opacity-60"
              >
                {deleting === showConfirm.id ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
