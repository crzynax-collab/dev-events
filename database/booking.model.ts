import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import Event, { IEvent } from './event.model';

/**
 * TypeScript interface for Booking document
 */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for Booking model
 */
const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => {
          // Email validation regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value) && value.trim().length > 0;
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Pre-save hook: Validates that the referenced event exists
 * Throws an error if the eventId does not correspond to an existing Event
 */
(bookingSchema as Schema).pre('save', async function () {
  const booking = this as unknown as IBooking;

  // Only validate if eventId is being set or modified
  if (booking.isModified('eventId')) {
    const event = await Event.findById(booking.eventId);
    if (!event) {
      throw new Error(`Event with ID ${booking.eventId} does not exist`);
    }
  }
});

// Create index on eventId for faster queries when filtering bookings by event
bookingSchema.index({ eventId: 1 });

/**
 * Booking model
 */
const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;

