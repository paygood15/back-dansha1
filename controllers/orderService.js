const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const axios = require("axios");
const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");

// Paymob API Key (يجب استبدالها بمفتاح API الخاص بك)

// @desc    Create new order
// @route   POST /api/orders/cartId
// @access  Private/Protected/User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get logged user cart
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no cart for this user :${req.user._id}`, 404)
    );
  }

  // 2) Check if there is coupon apply
  const cartPrice = cart.totalAfterDiscount
    ? cart.totalAfterDiscount
    : cart.totalCartPrice;

  // 3) Create order with default cash option
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.products,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice: taxPrice + shippingPrice + cartPrice,
  });

  // 4) After creating order decrement product quantity, increment sold
  // Performs multiple write operations with controls for order of execution.
  if (order) {
    const bulkOption = cart.products.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    }));

    await Product.bulkWrite(bulkOption, {});

    // 5) Clear cart
    await Cart.findByIdAndDelete(req.params.cartId);
  }

  res.status(201).json({ status: "success", data: order });
});

// @desc    Get Specific order
// @route   GET /api/orders/:id
// @access  Private/Protected/User-Admin
exports.getSpecificOrder = factory.getOne(Order);

exports.filterOrdersForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObject = { user: req.user._id };
  next();
});

// @desc    Get my orders
// @route   GET /api/orders
// @access  Private/Protected/User-Admin
exports.getAllOrders = factory.getAll(Order);

// @desc    Update  order to  paid
// @route   PUT /api/orders/:id/pay
// @access  Private/Protected/User-Admin
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ApiError(`There is no order for this id: ${req.params.id}`, 404)
    );
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();
  res.status(200).json({
    status: "Success",
    data: updatedOrder,
  });
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ApiError(`There is no order for this id: ${req.params.id}`, 404)
    );
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();
  res.status(200).json({ status: "Success", data: updatedOrder });
});


const webhookCheckout = async (req) => {
  try {
    const body = req.body || {};
    const eventType = body.event_type;

    if (eventType === "payment.created") {
      const paymentId = body.payment_id;
      const payment = await axios.get(
        `https://accept.paymob.com/api/ecommerce/payments/${paymentId}`,
        {
          headers: {
            "Authorization": `Bearer ${process.env.PAYMOB_API_KEY}`
          }
        }
      );

      const paymentStatus = payment.data.status;
      const orderId = payment.data.delivery_data.order_id;

      if (paymentStatus === "completed") {
        // Update the order status to paid
        await Order.findByIdAndUpdate(orderId, { isPaid: true, paidAt: Date.now() });
      }else await Order.findByIdAndUpdate(orderId, { isPaid: false, paidAt: Date.now() });
    }
  } catch (error) {
    console.error("Error in webhookCheckout function:", error.message);
  }
};


//
//
//
//
//
//
//
//
// From here I started working on the code. Do not change anything in the previous code that has nothing to do with Paymob
// @desc    Create order checkout session
// @route   GET /api/orders/:cartId
// @access  Private/User
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`لا يوجد سلة لهذا المستخدم: ${req.user._id}`, 404)
    );
  }

  const cartPrice = cart.totalAfterDiscount
    ? cart.totalAfterDiscount
    : cart.totalCartPrice;

  try {
    const authResponse = await axios.post(
      "https://accept.paymob.com/api/auth/tokens",
      { api_key: process.env.PAYMOB_API_KEY }
    );
    const authToken = authResponse.data.token;

    const orderResponse = await axios.post(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: cartPrice * 100,
        currency: "EGP",
        items: [],
      }
    );

    const paymentKeyResponse = await axios.post(
      "https://accept.paymob.com/api/acceptance/payment_keys",
      {
        auth_token: authToken,
        amount_cents: cartPrice * 100,
        expiration: 3600,
        order_id: orderResponse.data.id,
        billing_data: req.body.shippingAddress,
        currency: "EGP",
        integration_id: process.env.YOUR_INTEGRATION_ID,
      }
    );

    if (paymentKeyResponse.data.token) {
      // Create the order
      const order = await Order.create({
        user: req.user._id,
        cartItems: cart.products,
        shippingAddress: req.body.shippingAddress,
        totalOrderPrice: cartPrice,
      });

      if (!order) {
        throw new ApiError("Failed to create order", 500);
      }

      // Decrement product quantity, increment sold
      const bulkOption = cart.products.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      }));

      await Product.bulkWrite(bulkOption, {});

      // Clear cart
      await Cart.findByIdAndDelete(req.params.cartId);

      // Call webhookCheckout after creating the order
      await webhookCheckout(req.body);

      // Return success response with payment link
      res.status(200).json({
        success: true,
        link: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME}?payment_token=${paymentKeyResponse.data.token}`,
      });
    } else {
      throw new ApiError("Failed to generate payment token", 500);
    }
  } catch (error) {
    console.error("Error in checkoutSession function:", error.message);
    next(new ApiError("Failed to complete checkout", 500));
  }
});
const createOrderCheckout = async (session) => {
  //  get data from session
  const cartId = session.client_reference_id;
  const checkoutAmount = session.display_items[0].amount / 100;
  // const shippingAddress = session.metadata;

  // get user cart and user data from session
  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });

  //  create order
  const order = await Order.create({
    user: user._id,
    cartItems: cart.products,
    billing_data: {
      apartment: "803",
      email: "claudette09@exa.com",
      floor: "42",
      first_name: "Clifford",
      street: "Ethan Land",
      building: "8028",
      phone_number: "+86(8)9135210487",
      shipping_method: "PKG",
      postal_code: "01898",
      city: "Jaskolskiburgh",
      country: "CR",
      last_name: "Nicolas",
      state: "Utah",
    },
    totalOrderPrice: checkoutAmount,
    paymentMethodType: "card",
    isPaid: true,
    paidAt: Date.now(),
  });

  //  order Handle
  if (order) {
    const bulkOption = cart.products.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    }));

    await Product.bulkWrite(bulkOption, {});

    // Delete Cart
    await Cart.findByIdAndDelete(cart._id);
  }
};

