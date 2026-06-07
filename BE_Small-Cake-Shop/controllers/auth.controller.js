const Validator = require('fastest-validator');
const v = new Validator();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { response } = require('../helpers/response.formatter');
const { User } = require('../models');

module.exports = {

  // POST /auth/register
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const schema = {
        name     : { type: 'string', min: 3 },
        email    : { type: 'email' },
        password : { type: 'string', min: 6 }
      };

      const validate = v.validate({ name, email, password }, schema);
      if (validate.length > 0)
        return res.status(400).json(response(400, 'error validasi', validate));

      const existing = await User.findOne({ where: { email } });
      if (existing)
        return res.status(400).json(response(400, 'email sudah terdaftar'));

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashed, role: 'user' });

      // jangan kirim password ke response
      const { password: _, ...userData } = user.toJSON();
      return res.status(201).json(response(201, 'registrasi berhasil', userData));
    } catch (error) {
      return res.status(500).json(response(500, 'server error', error));
    }
  },

  // POST /auth/login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const schema = {
        email    : { type: 'email' },
        password : { type: 'string', min: 6 }
      };

      const validate = v.validate({ email, password }, schema);
      if (validate.length > 0)
        return res.status(400).json(response(400, 'error validasi', validate));

      const user = await User.findOne({ where: { email } });
      if (!user)
        return res.status(401).json(response(401, 'email atau password salah'));

      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res.status(401).json(response(401, 'email atau password salah'));

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.AUTH_SECRET,
        { expiresIn: '1d' }
      );

      return res.status(200).json(response(200, 'login berhasil', { token }));
    } catch (error) {
      return res.status(500).json(response(500, 'server error', error));
    }
  }

};