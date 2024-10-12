import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Package from './models/Package.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: `${__dirname}/../.env` });

const MONGO_URI = process.env.MONGO_URI;

console.log('MONGO_URI:', MONGO_URI); // Zur Überprüfung

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in the environment variables');
  process.exit(1);
}

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

const packages = [
  {
    name: "Hauptpaket",
    price: 59.99,
    description: "Unser vollständiges Eventpaket mit allen Features",
    isMainPackage: true,
    features: {
      photoLimit: -1,
      videoLimit: -1,
      albumCount: 3,
      storageDuration: 6,
      fullAlbumDownloads: 3,
      guestLimit: -1,
      likeFunction: true,
      commentFunction: true,
      photoChallenges: true,
      fullQualityImages: true
    },
    addOns: [
      {
        name: "Zusätzliche Speicherzeit",
        price: 10,
        description: "+6 Monate Speicherdauer"
      },
      {
        name: "Zusätzliche Album-Downloads",
        price: 4.99,
        description: "Pro zusätzlichen Download"
      },
      {
        name: "Zusätzliches Album",
        price: 5.99,
        description: "Ein weiteres Album mit gleichen Leistungen"
      }
    ]
  },
  {
    name: "Kostenlos",
    price: 0,
    description: "Unser kostenloses Paket zum Testen",
    isMainPackage: false,
    features: {
      photoLimit: 10,
      videoLimit: 1,
      albumCount: 1,
      storageDuration: 1,
      fullAlbumDownloads: 0,
      guestLimit: 10,
      likeFunction: false,
      commentFunction: false,
      photoChallenges: false,
      fullQualityImages: false
    },
    addOns: []
  }
];

const seedDB = async () => {
  try {
    await Package.deleteMany({});
    await Package.insertMany(packages);
    console.log('Packages seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();