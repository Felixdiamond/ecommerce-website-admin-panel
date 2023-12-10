import { mongooseConnect } from "@/lib/mongoose";
import Product from "@/models/Product";

export default async function handle(req, res) {
  await mongooseConnect();

  const { imageUrl, productId } = req.body;

  try {
    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Add the image URL to the product's images array
    product.images.push(imageUrl);

    // Save the product
    await product.save();

    res.status(200).json({ message: 'Image added successfully' });
  } catch (err) {
    console.error('Error adding image:', err);
    res.status(500).json({ error: 'An error occurred while adding the image' });
  }
}
