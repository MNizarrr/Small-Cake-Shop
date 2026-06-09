import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProductById,
  createProduct,
  updateProduct,
} from "../../services/api";
import { FiArrowLeft, FiUpload } from "react-icons/fi";
import { MdOutlineCake } from "react-icons/md";

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setFetching(true);
    try {
      const res = await getProductById(id);
      const p = res.data.data;
      setForm({
        name: p.name || "",
        description: p.description || "",
        price: p.price || "",
        stock: p.stock ?? "",
      });
      if (p.image) setPreview(`http://localhost:3000/uploads/${p.image}`);
    } catch {
      navigate("/admin/products");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      if (image) formData.append("image", image);

      if (isEdit) {
        await updateProduct(id, formData);
      } else {
        await createProduct(formData);
      }
      navigate("/admin/products");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan produk");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-400 border-t-transparent"></div>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Back */}
      <button
        onClick={() => navigate("/admin/products")}
        className="flex items-center gap-2 text-gray-500 hover:text-pink-500 text-sm mb-6 transition"
      >
        <FiArrowLeft /> Kembali ke Daftar Produk
      </button>

      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-xl font-bold text-gray-800 mb-6">
          {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
        </h1>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm px-4 py-2 rounded-lg mb-4 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Upload Gambar */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Gambar Produk {!isEdit && <span className="text-red-400">*</span>}
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-pink-50 flex items-center justify-center flex-shrink-0">
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <MdOutlineCake size={32} className="text-pink-200" />
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer border border-dashed border-pink-300 text-pink-500 hover:bg-pink-50 text-sm font-medium px-4 py-2.5 rounded-xl transition">
                <FiUpload size={16} />
                {preview ? "Ganti Gambar" : "Upload Gambar"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Nama */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Nama Produk <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Contoh: Kue Lapis Coklat"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Deskripsi produk..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
            />
          </div>

          {/* Harga & Stok */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Harga (Rp) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0"
                required
                min="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Stok
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="Opsional"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl text-sm transition disabled:opacity-60 mt-2"
          >
            {loading
              ? "Menyimpan..."
              : isEdit
                ? "Simpan Perubahan"
                : "Tambah Produk"}
          </button>
        </form>
      </div>
    </div>
  );
}
