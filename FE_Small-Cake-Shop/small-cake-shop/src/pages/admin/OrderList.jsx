import { useState, useEffect } from "react";
import { getAllOrders, updateOrderStatus } from "../../services/api";
import { MdOutlineCake } from "react-icons/md";
import { FiChevronDown } from "react-icons/fi";

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

const allStatuses = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getAllOrders(page);
      setOrders(res.data.data.data);
      setPagination(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, { status });
      fetchOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-400 border-t-transparent"></div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Kelola Order</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <MdOutlineCake size={48} className="text-pink-200 mx-auto mb-4" />
          <p className="text-gray-400">Belum ada order masuk.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() =>
                    setExpanded(expanded === order.id ? null : order.id)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[order.status]}`}
                    >
                      {statusLabel[order.status]}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="font-bold text-pink-500 text-sm">
                      Rp {Number(order.total_amount).toLocaleString("id-ID")}
                    </p>
                    <FiChevronDown
                      className={`text-gray-400 transition-transform ${expanded === order.id ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>

                {/* Detail — expanded */}
                {expanded === order.id && (
                  <div className="border-t px-5 py-4">
                    {/* Items */}
                    <div className="flex flex-col gap-2 mb-4">
                      {order.OrderItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-pink-50 flex-shrink-0 flex items-center justify-center">
                            {item.Product.image ? (
                              <img
                                src={`http://localhost:3000/uploads/${item.Product.image}`}
                                alt={item.Product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <MdOutlineCake
                                size={16}
                                className="text-pink-200"
                              />
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

                    {/* Alamat */}
                    <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
                      <p className="text-xs text-gray-400 mb-0.5">
                        Alamat Pengiriman
                      </p>
                      <p className="text-gray-700">{order.shipping_address}</p>
                      {order.note && (
                        <p className="text-xs text-gray-400 mt-1">
                          Catatan: {order.note}
                        </p>
                      )}
                    </div>

                    {/* Update Status */}
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-gray-600">
                        Update Status:
                      </p>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        disabled={updating === order.id}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:opacity-60"
                      >
                        {allStatuses.map((s) => (
                          <option key={s} value={s}>
                            {statusLabel[s]}
                          </option>
                        ))}
                      </select>
                      {updating === order.id && (
                        <span className="text-xs text-gray-400">
                          Menyimpan...
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
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
    </div>
  );
}
