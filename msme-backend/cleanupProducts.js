const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function fullCleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    // 1. Delete products with 0 price or matching "test"
    const productResult = await mongoose.connection.collection('products').deleteMany({
      $or: [
        { price: 0 },
        { name: { $regex: /test/i } },
        { name: "" }
      ]
    });
    console.log(`Deleted ${productResult.deletedCount} invalid products`);

    // 2. Clear all carts to remove potential orphan product references
    const CartSchema = new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId, items: Array });
    const Cart = mongoose.models.Cart || mongoose.model('Cart', CartSchema, 'carts');
    const cartResult = await Cart.deleteMany({});
    console.log(`Cleared ${cartResult.deletedCount} user carts`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fullCleanup();
