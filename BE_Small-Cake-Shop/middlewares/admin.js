const { response } = require("../helpers/response.formatter");

module.exports = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json(response(403, "akses ditolak, hanya admin"));
  next();
};
