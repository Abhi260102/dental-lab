const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

let MONGODB_URI = 'mongodb://localhost:27017/dental-warranty';
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^MONGODB_URI=(.+)$/m);
    if (match) {
      MONGODB_URI = match[1].trim();
    }
  }
} catch (e) {
  console.log("Error reading .env, using default URI");
}

async function run() {
  console.log("Connecting to:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected! Synchronizing indexes...");
  
  // Re-define minimalist schemas to build the same indexes
  const Schema = mongoose.Schema;
  
  const WarrantyCardSchema = new Schema({}, { strict: false, collection: 'warrantycards' });
  WarrantyCardSchema.index({ createdAt: -1 });
  WarrantyCardSchema.index({ createdBy: 1, createdAt: -1 });
  
  const ActivityLogSchema = new Schema({}, { strict: false, collection: 'activitylogs' });
  ActivityLogSchema.index({ timestamp: -1 });
  ActivityLogSchema.index({ userId: 1, timestamp: -1 });

  const TemplateSchema = new Schema({}, { strict: false, collection: 'templates' });
  TemplateSchema.index({ isDefault: 1, createdBy: 1, updatedAt: -1 });
  TemplateSchema.index({ createdBy: 1, updatedAt: -1 });

  const WarrantyCard = mongoose.model('WarrantyCard', WarrantyCardSchema);
  const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
  const Template = mongoose.model('Template', TemplateSchema);

  await WarrantyCard.createIndexes();
  console.log("Created/Verified indexes for WarrantyCard");
  
  await ActivityLog.createIndexes();
  console.log("Created/Verified indexes for ActivityLog");

  await Template.createIndexes();
  console.log("Created/Verified indexes for Template");

  await mongoose.disconnect();
  console.log("Index synchronization complete!");
}

run().catch(console.error);
