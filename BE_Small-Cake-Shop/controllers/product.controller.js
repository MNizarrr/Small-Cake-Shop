const Validator = require("fastest-validator");
const v = new Validator();
const { response } = require("../helpers/response.formatter");
const { Product } = require("../models");
const { options } = require("../routes/product.routes");
const { toDefaultValue, format } = require("sequelize/lib/utils");

module.exports = {
  // GET semua produk
  getAll: async (req, res) => {
    try {
      // kalo ga ada query params page, isi angka 1 pagenya
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 5;

      // rumus ambil data pagination :
      // offset * 5 = 0, offset 0 artinya page 1 data dimulai dari barus ke 1
      // (2-1) * 5 = 5, offset 5 artinya page 2 data dimulai dari baris ke 6
      const offset = (page - 1) * limit;

      const { count, rows } = await Product.findAndCountAll({
        where: { is_active: true },
        offset: offset,
        limit: limit,
      });

      const formatPagination = {
        data: rows,
        limit: limit,
        rangeData: `${offset + 1} - ${offset + rows.length}`,
        currentPage: page,
        totalPage: Math.round(count / limit),
        total: count,
      };

      return res.status(200).json(response(200, "succes", formatPagination));
    } catch (error) {
      return res.status(500).json(response(500, "server error", error.message));
    }
  },

  // GET produk by ID
  getById: async (req, res) => {
    try {
      const product = await Product.findOne({
        where: { id: req.params.id, is_active: true },
      });
      if (!product)
        return res.status(404).json(response(404, "produk tidak ditemukan"));
      return res.status(200).json(response(200, "success", product));
    } catch (error) {
      return res.status(500).json(response(500, "server error", error));
    }
  },

  // POST buat produk baru (admin only)
  create: async (req, res) => {
    try {
      const { name, description, price, stock } = req.body;

      const schema = {
        name: { type: "string", min: 3 },
        description: { type: "string", optional: true },
        price: { type: "number", positive: true },
        stock: { type: "number", min: 0, integer: true, optional: true },
      };

      const data = {
        name,
        description,
        price: Number(price),
        stock: stock !== undefined && stock !== "" ? Number(stock) : null,
      };

      const validate = v.validate(data, schema);
      if (validate.length > 0)
        return res.status(400).json(response(400, "error validasi", validate));

      if (!req.file)
        return res.status(400).json(response(400, "gambar tidak boleh kosong"));

      const product = await Product.create({
        ...data,
        image: req.file.filename,
      });

      return res
        .status(201)
        .json(response(201, "produk berhasil dibuat", product));
    } catch (error) {
      return res.status(500).json(response(500, "server error", error));
    }
  },

  // PUT update produk (admin only)
  update: async (req, res) => {
    try {
      const product = await Product.findOne({
        where: { id: req.params.id },
      });
      if (!product)
        return res.status(404).json(response(404, "produk tidak ditemukan"));

      const { name, description, price, stock } = req.body;

      const schema = {
        name: { type: "string", min: 3, optional: true },
        description: { type: "string", optional: true },
        price: { type: "number", positive: true, optional: true },
        stock: { type: "number", min: 0, integer: true, optional: true },
      };

      const data = {
        name: name ?? product.name,
        description: description ?? product.description,
        price: price ? Number(price) : product.price,
        stock: stock ? Number(stock) : product.stock,
        image: req.file ? req.file.filename : product.image,
      };

      const validate = v.validate(data, schema);
      if (validate.length > 0)
        return res.status(400).json(response(400, "error validasi", validate));

      await Product.update(data, { where: { id: req.params.id } });
      return res
        .status(200)
        .json(response(200, "produk berhasil diupdate", data));
    } catch (error) {
      return res.status(500).json(response(500, "server error", error));
    }
  },

  // DELETE produk (admin only) — soft delete
  destroy: async (req, res) => {
    try {
      const product = await Product.findOne({ where: { id: req.params.id } });
      if (!product)
        return res.status(404).json(response(404, "produk tidak ditemukan"));

      await Product.update(
        { is_active: false },
        { where: { id: req.params.id } },
      );
      return res.status(200).json(response(200, "produk berhasil dihapus"));
    } catch (error) {
      return res.status(500).json(response(500, "server error", error));
    }
  },
};
