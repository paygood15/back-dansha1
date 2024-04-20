const categoryRouter = require('./categoryRoute');
const subCategoryRouter = require('./subCategoryRoute');
const brandRouter = require('./brandRoute');
const productRouter = require('./productRoute');
const userRouter = require('./userRoute');
const authRouter = require('./authRoute');
const reviewRouter = require('./reviewRoute');
const wishlistRouter = require('./wishlistRoute');
const addressRouter = require('./addressRoute');
const couponRouter = require('./couponRoute');
const cartRouter = require('./cartRoute');
const orderRouter = require('./orderRoute');
const partnerRouter = require("./partner.Route")
const contactRouter = require("./contact.Route")
const event = require("./event.Route")



const mountRoutes = (app) => {
  app.use('/api/v1/categories', categoryRouter);
  app.use('/api/v1/subcategories', subCategoryRouter);
  app.use('/api/v1/brands', brandRouter);
  app.use('/api/v1/products', productRouter);
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/reviews', reviewRouter);
  app.use('/api/v1/wishlist', wishlistRouter);
  app.use('/api/v1/addresses', addressRouter);
  app.use('/api/v1/coupons', couponRouter);
  app.use('/api/v1/cart', cartRouter);
  app.use('/api/v1/orders', orderRouter);


app.use('/api/partner',partnerRouter)
app.use('/api/event',event)
app.use('/api/contact',contactRouter)
};

module.exports = mountRoutes;
