import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrders } from "../services/api";
import { MdOutlineCake } from "react-icons/md";
import { FiPackage } from "react-icons/fi";

const statusColor = {
  pending: "bg-yellow-100 text-yellow-600",
  processing: "bg-blue-100 text-blue-600",
  shipped: "bg-indigo-100 text-indigo-600",
  delivered: "bg-green-100 text-green-600",
  cancelled: "bg-red-100 text-red-500",
  refunded: "bg-gray-100 text-gray-500",
};

const statusLabel = {
  pending: "Menunggu",
  processing: "Diproses",
  shipped: "Dikirim",
  delivered: "Selesai",
  cancelled: "Dibatalkan",
  refunded: "Dikembalikan",
};

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getMyOrders(page);
      setOrders(res.data.data.data);
      setPagination(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-400 border-t-transparent"></div>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Riwayat Pesanan</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <FiPackage size={48} className="text-pink-200 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Belum ada pesanan.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-pink-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-pink-600 transition"
          >
            Mulai Belanja
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm p-5"
              >
                {/* Header Order */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Nomor Order</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {order.order_number}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor[order.status]}`}
                  >
                    {statusLabel[order.status]}
                  </span>
                </div>

                {/* List Produk */}
                <div className="flex flex-col gap-2 mb-3">
                  {order.OrderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-pink-50 flex-shrink-0 flex items-center justify-center">
                        {item.Product.image ? (
                          <img
                            src={`http://localhost:3000/uploads/${item.Product.image}`}
                            alt={item.Product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <MdOutlineCake size={20} className="text-pink-200" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">
                          {item.Product.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.quantity} x Rp{" "}
                          {Number(item.price_at_purchase).toLocaleString(
                            "id-ID",
                          )}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-700">
                        Rp{" "}
                        {(
                          item.quantity * Number(item.price_at_purchase)
                        ).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer Order */}
                <div className="border-t pt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Alamat Pengiriman</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {order.shipping_address}
                    </p>
                    {order.note && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Catatan: {order.note}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="font-bold text-pink-500">
                      Rp {Number(order.total_amount).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPage > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
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
    </div>
  );
}
