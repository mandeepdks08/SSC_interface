const { connectCartWithCartId, isPaired, pairCartUsingPairingCode } = require("../customMethods");

module.exports.renderConnectCartPage = async (req, res) => {
  res.render("connectCart");
};

module.exports.connectCart = async (req, res) => {
  const { cartid } = req.body;
  try {
    await connectCartWithCartId(cartid, req.user.email);
    res.redirect("/cart/interface");
  } catch (err) {
    console.log(err);
    res.redirect("/cart/connect");
  }
};

module.exports.renderCartInterface = async (req, res) => {
  const result = await isPaired(req.user);
  if(result)
    return res.render("cartInterfacePaired");
  res.render("cartInterface");
};

module.exports.renderCheckoutPage = async (req, res) => {
  res.render("checkout");
};

module.exports.checkout = async (req, res) => {
  const { paymentPin } = req.body;
  await checkoutUser(paymentPin);
  res.redirect("/cart/checkout/success");
};

module.exports.renderPaymentSuccessfulPage = (req, res) => {
  res.render("paymentSuccessful");
};

module.exports.pairCart = async (req, res) => {
  const pairingCode = req.body["pair-cart-input"];
  console.log("Pairing code: ", pairingCode);
  try {
    await pairCartUsingPairingCode(pairingCode, req.user);
  } catch(err) {
    console.log(err);
  }
  res.redirect("/cart/interface");
}