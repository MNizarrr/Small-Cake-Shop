const Validator = require("fastest-validator");
const v = new Validator();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { response } = require("../helpers/response.formatter");

module.exports = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // validasi
      const schema = {
        email: { type: "email" },
        password: { type: "string", min: 6 },
      };

      const validate = v.validate({ email, password }, schema);
      if (validate.length > 0)
        return res.status(400).json(response(400, "error validasi", validate));

      // ambil data user berdasarkan email
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(400).json(response(400, "User not found"));

      // verifikasi password hash
      const verified = await bcrypt.compare(password, user.password);
      if (!verified)
        return res.status(400).json(response(400, "Invalid password"));

      // membuat token
      const token = jwt.sign(
        {
          id: user.id,
          userId: user.id,
          role: user.role,
        },
        process.env.AUTH_SECRET,
        { expiresIn: "1d" },
      );

      const data = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      };

      return res.status(200).json(response(200, "loggedin", data));
    } catch (error) {
      return res.status(500).json(response(500, "server error", error.message));
    }
  },
};
