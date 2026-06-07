const express = require('express')
const app = express()
const port = 3000;
require('dotenv').config();

const db = require('./models')
const authRoutes = require('./routes/auth.routes');
const loginRoutes = require('./routes/login.routes');
const cartRoutes = require('./routes/cart.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes')
const authMiddleware = require('./middlewares/auth');

db.sequelize.authenticate()
    .then(() => console.log("Database berhasil tersambung"))
    .catch(err => console.error(err))

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/login', loginRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

app.use('/auth', authRoutes);
app.use('/products', authMiddleware, productRoutes);

app.get('/', (req, res) => {
    res.send('Haii masbro !?')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
