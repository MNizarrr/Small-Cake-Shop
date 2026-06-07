const jwt = require('jsonwebtoken');
const { response } = require('../helpers/response.formatter');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : authHeader;

    if (!token)
        return res.status(401).json(response(401, 'token tidak ada silahkan login'));

    try {
        const decoded = jwt.verify(token, process.env.AUTH_SECRET);
        req.user = decoded; // { id, userId, role }
        req.userId = decoded.userId || decoded.id;
        next();
    } catch (error) {
        return res.status(401).json(response(401, 'token tidak valid'));
    }
};
