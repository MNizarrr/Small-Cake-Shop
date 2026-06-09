import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, removeFromCart, checkout } from "../services/api";
import { MdOutlineCake } from "react-icons/md";
import { FiTrash2, FiShoppingBag } from "react-icons/fi";

export default function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await getCart();
      setCart(res.data.data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    setRemoving(id);
    try {
      await removeFromCart(id);
      fetchCart();
    } catch (err) {
      console.error(err);
    } finally {
      setRemoving(null);
    }
  };

  const handleCheckout = async () => {
    if (!address.trim()) return setError("Alamat pengiriman wajib diisi");
    setError("");
    setCheckingOut(true);
    try {
      await checkout({ shipping_address: address, note });
      setShowModal(false);
      navigate("/orders");
    } catch (err) {
      setError(err.response?.data?.message || "Checkout gagal");
    } finally {
      setCheckingOut(false);
    }
  };

  const totalHarga =
    cart?.CartItems?.reduce((total, item) => {
      return total + item.quantity * Number(item.Product.price);
    }, 0) || 0;

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-400 border-t-transparent"></div>
      </div>
    );

  const isEmpty = !cart || !cart.CartItems || cart.CartItems.length === 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Keranjang Belanja
      </h1>

      {isEmpty ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <MdOutlineCake size={56} className="text-pink-200 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Keranjang kamu masih kosong.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-pink-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-pink-600 transition"
          >
            Mulai Belanja
          </button>
        </div>
      ) : (
        <>
          {/* List Item */}
          <div className="flex flex-col gap-4 mb-6">
            {cart.CartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4"
              >
                {/* Gambar */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-pink-50 flex-shrink-0 flex items-center justify-center">
                  {item.Product.image ? (
                    <img
                      src={`http://localhost:3000/uploads/${item.Product.image}`}
                      alt={item.Product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <MdOutlineCake size={32} className="text-pink-200" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {item.Product.name}
                  </h3>
                  <p className="text-pink-500 font-bold text-sm mt-0.5">
                    Rp {Number(item.Product.price).toLocaleString("id-ID")}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Jumlah: {item.quantity}
                  </p>
                </div>

                {/* Subtotal */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-700">
                    Rp{" "}
                    {(
                      item.quantity * Number(item.Product.price)
                    ).toLocaleString("id-ID")}
                  </p>
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={removing === item.id}
                    className="mt-2 text-red-400 hover:text-red-600 transition disabled:opacity-40"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Total Harga</span>
              <span className="text-xl font-bold text-pink-500">
                Rp {totalHarga.toLocaleString("id-ID")}
              </span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl transition"
            >
              <FiShoppingBag /> Checkout
            </button>
          </div>
        </>
      )}

      {/* Modal Checkout */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Konfirmasi Checkout
            </h2>

            {error && (
              <div className="bg-red-50 text-red-500 text-sm px-4 py-2 rounded-lg mb-4 border border-red-200">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Alamat Pengiriman <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Masukkan alamat lengkap pengiriman..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Catatan{" "}
                  <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: Tolong dibungkus rapi"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div className="flex justify-between text-sm text-gray-600 bg-pink-50 px-4 py-3 rounded-lg">
                <span>Total Pembayaran</span>
                <span className="font-bold text-pink-500">
                  Rp {totalHarga.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
                className="flex-1 border border-gray-300 text-gray-600 font-medium py-2.5 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2.5 rounded-xl text-sm transition disabled:opacity-60"
              >
                {checkingOut ? "Memproses..." : "Konfirmasi Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
