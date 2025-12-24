const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load .env manually
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const Event = require('./database/event.model');

async function fixData() {
  await mongoose.connect(process.env.MONGODB_URI);
  const events = await Event.find({});
  for (const event of events) {
    if (event.tags && event.tags.length > 0) {
      event.tags = event.tags.map(tag => {
        try {
          const parsed = JSON.parse(tag);
          return Array.isArray(parsed) ? parsed : [tag];
        } catch {
          return tag.split(',').map(t => t.trim().replace(/^["']|["']$/g, ''));
        }
      }).flat();
    }
    if (event.agenda && event.agenda.length > 0) {
      event.agenda = event.agenda.map(item => {
        try {
          const parsed = JSON.parse(item);
          return Array.isArray(parsed) ? parsed : [item];
        } catch {
          return item.split(',').map(a => a.trim().replace(/^["']|["']$/g, ''));
        }
      }).flat();
    }
    await event.save();
  }
  console.log('Fixed');
  process.exit();
}

fixData().catch(console.error);