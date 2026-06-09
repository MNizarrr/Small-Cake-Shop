import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getAllOrders,
  getProducts,
  exportExcel,
  exportPdf,
} from "../../services/api";
import {
  FiPackage,
  FiShoppingBag,
  FiDownload,
  FiTrendingUp,
} from "react-icons/fi";
import { MdOutlineCake } from "react-icons/md";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

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

const PIE_COLORS = [
  "#f472b6",
  "#60a5fa",
  "#818cf8",
  "#34d399",
  "#f87171",
  "#9ca3af",
];

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        getAllOrders(1),
        getProducts(1, 100),
      ]);
      setOrders(ordersRes.data.data.data);
      setProducts(productsRes.data.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const res = type === "excel" ? await exportExcel() : await exportPdf();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        type === "excel"
          ? "Data_Order_Small_Cake_Shop.xlsx"
          : "Data_Order_Small_Cake_Shop.pdf",
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    } finally {
      setExporting("");
    }
  };

  // Hitung stats
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  // Data chart bar — pendapatan per order (5 terbaru)
  const barData = orders
    .slice(0, 7)
    .map((o) => ({
      name: o.order_number.replace("ORD-", "").slice(-6),
      total: Number(o.total_amount),
    }))
    .reverse();

  // Data chart pie — distribusi status order
  const statusCount = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCount).map(([key, value]) => ({
    name: statusLabel[key],
    value,
  }));

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-400 border-t-transparent"></div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Dashboard Admin</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
            <FiTrendingUp size={22} className="text-pink-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Pendapatan</p>
            <p className="text-xl font-bold text-gray-800">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <FiPackage size={22} className="text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Order</p>
            <p className="text-xl font-bold text-gray-800">{orders.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <MdOutlineCake size={22} className="text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Produk</p>
            <p className="text-xl font-bold text-gray-800">{products.length}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart — Pendapatan per Order */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">
            Pendapatan per Order
          </h2>
          {barData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">
              Belum ada data.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={barData}
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v) => [
                    `Rp ${v.toLocaleString("id-ID")}`,
                    "Total",
                  ]}
                />
                <Bar dataKey="total" fill="#f472b6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart — Status Order */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">
            Distribusi Status Order
          </h2>
          {pieData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">
              Belum ada data.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Quick Links + Export */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Menu Cepat</h2>
          <div className="flex flex-col gap-2">
            <Link
              to="/admin/products"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-pink-50 text-pink-600 font-medium text-sm hover:bg-pink-100 transition"
            >
              <MdOutlineCake size={18} /> Kelola Produk
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-medium text-sm hover:bg-blue-100 transition"
            >
              <FiShoppingBag size={18} /> Kelola Order
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">
            Export Data Order
          </h2>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleExport("excel")}
              disabled={exporting === "excel"}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 text-green-700 font-medium text-sm hover:bg-green-100 transition disabled:opacity-60"
            >
              <FiDownload size={18} />
              {exporting === "excel" ? "Mengunduh..." : "Export Excel (.xlsx)"}
            </button>
            <button
              onClick={() => handleExport("pdf")}
              disabled={exporting === "pdf"}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 transition disabled:opacity-60"
            >
              <FiDownload size={18} />
              {exporting === "pdf" ? "Mengunduh..." : "Export PDF (.pdf)"}
            </button>
          </div>
        </div>
      </div>

      {/* Order Terbaru */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">Order Terbaru</h2>
          <Link
            to="/admin/orders"
            className="text-pink-500 text-sm hover:underline"
          >
            Lihat semua
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">
            Belum ada order.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b text-xs">
                  <th className="pb-3 font-medium">Order Number</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3 font-medium text-gray-700">
                      {order.order_number}
                    </td>
                    <td className="py-3 text-gray-600">
                      Rp {Number(order.total_amount).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[order.status]}`}
                      >
                        {statusLabel[order.status]}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
