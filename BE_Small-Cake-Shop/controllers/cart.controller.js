const Validator = require('fastest-validator');
const v = new Validator();
const { response } = require('../helpers/response.formatter');
const { Cart, CartItem, Product } = require('../models');
const { where, Model } = require('sequelize');

module.exports = {

    // Tambah produk ke keranjang
    addItem: async (req, res) => {
        try {
            const { product_id, quantity } = req.body;

            // validasi input
            const schema = {
                product_id : { type: 'number', positive: true, integer: true },
                quantity : { type: 'number', min: 1, integer: true, optional: true}
            };

            const data = {
                product_id : Number(product_id),
                quantity : quantity ? Number(quantity) : 1
            };

            const validate = v.validate(data, schema);
            if (validate.length > 0)
                return res.status(400).json(response(400, 'error validasi', validate));

            // cek produk ada dan aktif
            const product = await Product.findOne({
                where: { id: product_id, is_active: true}
            });
            if (!product)
                return res.status(400).json(response(400, 'produk tidak ditemukan'));

            // ambil atau buat cart milik user
            const [cart] = await Cart.findOrCreate({
                where: { user_id: req.user.id }
            });

            // cek apakah produk sudah ada di keranjang
            const existing = await CartItem.findOne({
                where: { cart_id: cart.id, product_id }
            });

            if (existing) {
                // kalau sudah ada, tambah quantity saja
                await CartItem.update(
                    { quantity: existing.quantity + data.quantity },
                    { where: { id: existing.id } }
                );
            } else {
                // kalau belum ada buat baru
                await CartItem.create({
                    cart_id : cart.id,
                    product_id : data.product_id,
                    quantity : data.quantity
                });
            }

            // ambil cart terbaru beserta isinya
            const updateCart = await Cart.findOne({
                where: { id: cart.id },
                include: [{ model: CartItem, include: [Product] }]
            });

            return res.status(200).json(response(200, 'produk ditambahkan ke keranjang', updateCart));
        } catch (error) {
            return res.status(500).json(response(500, 'server error', error.message));
        }
    },

    // lihat isi keranjang 
    getCart: async (req, res) => {
        try {
            const cart = await Cart.findOne({
                where: { user_id: req.user.id },
                include: [{ model: CartItem, include: [Product] }]
            });

            if (!cart) return res.status(200).json(response(200, 'keranjang kosong', [] ));
            return res.status(200).json(response(200, 'success', cart))
        } catch (error) {
            return res.status(500).json(response(500, 'server error', error.message));
        }
    },

    // hapus item dari keranjang
    removeItem: async (req, res) => {
        try {
            const item = await CartItem.findOne({
                where: { id: req.params.id }
            });
            if (!item) return res.status(404).json(response(404, 'item tidak ditemukan'));

            await CartItem.destroy({ where: { id: req.params.id }});
            return res.status(200).json(response(200, 'item berhasil di hapus dari keranjang'));
        } catch (error) {
            return res.status(500).json(response(500, 'server error', error.message));
        }
    }
}