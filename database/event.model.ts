import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * TypeScript interface for Event document
 */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // ISO format string
  time: string; // Consistent format (HH:MM or HH:MM-HH:MM)
  mode: 'online' | 'offline' | 'hybrid';
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for Event model
 */
const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Title cannot be empty',
      },
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Description cannot be empty',
      },
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Overview cannot be empty',
      },
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Image cannot be empty',
      },
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Venue cannot be empty',
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Location cannot be empty',
      },
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true,
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be one of: online, offline, hybrid',
      },
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Audience cannot be empty',
      },
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (value: string[]) => value.length > 0 && value.every((item) => item.trim().length > 0),
        message: 'Agenda must contain at least one non-empty item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Organizer cannot be empty',
      },
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (value: string[]) => value.length > 0 && value.every((tag) => tag.trim().length > 0),
        message: 'Tags must contain at least one non-empty tag',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Generates a URL-friendly slug from a title
 * Converts to lowercase, replaces spaces and special chars with hyphens
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Normalizes date string to ISO format (YYYY-MM-DD)
 * Handles various input formats and converts to standard ISO date string
 */
function normalizeDate(dateString: string): string {
  const trimmed = dateString.trim();
  
  // If already in ISO format (YYYY-MM-DD), return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Try to parse and convert to ISO format
  const date = new Date(trimmed);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${trimmed}`);
  }

  return date.toISOString().split('T')[0]; // Extract YYYY-MM-DD part
}

/**
 * Normalizes time string to consistent format (HH:MM or HH:MM-HH:MM)
 * Ensures 24-hour format with leading zeros
 */
function normalizeTime(timeString: string): string {
  const trimmed = timeString.trim();
  
  // If already in HH:MM format, validate and return
  if (/^\d{2}:\d{2}(-\d{2}:\d{2})?$/.test(trimmed)) {
    return trimmed;
  }

  // Try to parse common time formats
  const timeMatch = trimmed.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const period = timeMatch[3]?.toUpperCase();

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    // Validate hours (0-23) and minutes (0-59) after conversion
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return trimmed; // Return original input if values are out of range
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Return as-is if parsing fails (let validation handle it)
  return trimmed;
}

/**
 * Pre-save hook: Generates slug from title and normalizes date/time
 * Only regenerates slug if title has changed
 */
(eventSchema as Schema).pre('save', async function () {
  const event = this as unknown as IEvent;

  // Generate slug only if title changed or slug doesn't exist
  if (event.isModified('title') || !event.slug) {
    event.slug = generateSlug(event.title);
  }

  // Normalize date to ISO format
  if (event.isModified('date') || !event.date) {
    try {
      event.date = normalizeDate(event.date);
    } catch (error) {
      throw error;
    }
  }

  // Normalize time to consistent format
  if (event.isModified('time') || !event.time) {
    event.time = normalizeTime(event.time);
  }
});

// Create unique index on slug for faster lookups
eventSchema.index({ slug: 1 }, { unique: true });

/**
 * Event model
 */
const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);

export default Event;

