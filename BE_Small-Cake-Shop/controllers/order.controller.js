const Validator = require('fastest-validator');
const v = new Validator();
const { response } = require('../helpers/response.formatter');
const { Order, OrderItem, Cart, CartItem, Product } = require('../models');

module.exports = {

  // POST checkout — buat order dari isi keranjang
  checkout: async (req, res) => {
    try {
      const { shipping_address, note } = req.body;

      const schema = {
        shipping_address : { type: 'string', min: 5 },
        note             : { type: 'string', optional: true }
      };

      const validate = v.validate({ shipping_address, note }, schema);
      if (validate.length > 0)
        return res.status(400).json(response(400, 'error validasi', validate));

      // ambil cart milik user beserta isinya
      const cart = await Cart.findOne({
        where   : { user_id: req.user.id },
        include : [{ model: CartItem, include: [Product] }]
      });

      if (!cart || cart.CartItems.length === 0)
        return res.status(400).json(response(400, 'keranjang kosong'));

      // hitung total harga
      const total_amount = cart.CartItems.reduce((total, item) => {
        return total + (item.quantity * item.Product.price);
      }, 0);

      // buat order number unik
      const order_number = `ORD-${Date.now()}`;

      // buat order
      const order = await Order.create({
        user_id          : req.user.id,
        order_number,
        total_amount,
        shipping_address,
        note             : note || null,
        status           : 'pending'
      });

      // buat order items dari cart items
      const orderItemsData = cart.CartItems.map(item => ({
        order_id          : order.id,
        product_id        : item.product_id,
        quantity          : item.quantity,
        price_at_purchase : item.Product.price,
        createdAt         : new Date(),
        updatedAt         : new Date()
      }));

      await OrderItem.bulkCreate(orderItemsData);

      // kosongkan keranjang setelah checkout
      await CartItem.destroy({ where: { cart_id: cart.id } });

      // ambil order lengkap beserta itemnya
      const fullOrder = await Order.findOne({
        where   : { id: order.id },
        include : [{ model: OrderItem, include: [Product] }]
      });

      return res.status(201).json(response(201, 'checkout berhasil', fullOrder));
    } catch (error) {
      return res.status(500).json(response(500, 'server error', error.message));
    }
  },

  // GET riwayat order milik user
  getMyOrders: async (req, res) => {
    try {
      const page   = Number(req.query.page)  || 1;
      const limit  = Number(req.query.limit) || 5;
      const offset = (page - 1) * limit;

      const { count, rows } = await Order.findAndCountAll({
        where   : { user_id: req.user.id },
        include : [{ model: OrderItem, include: [Product] }],
        offset,
        limit,
        order   : [['createdAt', 'DESC']]
      });

      const formatPagination = {
        data        : rows,
        limit,
        rangeData   : `${offset + 1} - ${offset + rows.length}`,
        currentPage : page,
        totalPage   : Math.round(count / limit),
        total       : count
      };

      return res.status(200).json(response(200, 'success', formatPagination));
    } catch (error) {
      return res.status(500).json(response(500, 'server error', error.message));
    }
  },

  // GET detail order by ID
  getOrderById: async (req, res) => {
    try {
      const order = await Order.findOne({
        where   : { id: req.params.id, user_id: req.user.id },
        include : [{ model: OrderItem, include: [Product] }]
      });

      if (!order) return res.status(404).json(response(404, 'order tidak ditemukan'));
      return res.status(200).json(response(200, 'success', order));
    } catch (error) {
      return res.status(500).json(response(500, 'server error', error.message));
    }
  },

  // GET semua order (admin only)
  getAllOrders: async (req, res) => {
    try {
      const page   = Number(req.query.page)  || 1;
      const limit  = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await Order.findAndCountAll({
        include : [{ model: OrderItem, include: [Product] }],
        offset,
        limit,
        order   : [['createdAt', 'DESC']]
      });

      const formatPagination = {
        data        : rows,
        limit,
        rangeData   : `${offset + 1} - ${offset + rows.length}`,
        currentPage : page,
        totalPage   : Math.round(count / limit),
        total       : count
      };

      return res.status(200).json(response(200, 'success', formatPagination));
    } catch (error) {
      return res.status(500).json(response(500, 'server error', error.message));
    }
  },

  // PUT update status order (admin only)
  updateStatus: async (req, res) => {
    try {
      const { status } = req.body;

      const schema = {
        status: { type: 'enum', values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] }
      };

      const validate = v.validate({ status }, schema);
      if (validate.length > 0)
        return res.status(400).json(response(400, 'error validasi', validate));

      const order = await Order.findOne({ where: { id: req.params.id } });
      if (!order) return res.status(404).json(response(404, 'order tidak ditemukan'));

      await Order.update({ status }, { where: { id: req.params.id } });

      const updated = await Order.findOne({
        where   : { id: req.params.id },
        include : [{ model: OrderItem, include: [Product] }]
      });

      return res.status(200).json(response(200, 'status order berhasil diupdate', updated));
    } catch (error) {
      return res.status(500).json(response(500, 'server error', error.message));
    }
  }

};