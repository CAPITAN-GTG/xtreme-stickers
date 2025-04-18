import mongoose from 'mongoose';

const stickerSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  size: {
    id: {
      type: Number,
      required: [true, 'Size ID is required'],
    },
    size: {
      type: String,
      required: [true, 'Size description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  total: {
    type: Number,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  orderId: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'processing', 'completed'],
    default: 'draft',
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
  },
});

// Calculate total before saving
stickerSchema.pre('save', function(next) {
  if (this.size && this.size.price && this.quantity) {
    this.total = this.size.price * this.quantity;
  }
  next();
});

// Create the model if it doesn't exist, otherwise use the existing one
const Sticker = mongoose.models.Sticker || mongoose.model('Sticker', stickerSchema);

export default Sticker; 