import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import Package from '../models/Package.js';
import { handleStripeWebhook } from '../controllers/stripeWebhookController.js';
import { updateUserPackage } from '../services/userPackageService.js'; // Stellen Sie sicher, dass der Pfad korrekt ist

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Dynamische Auswahl der Frontend-URL
const frontendUrl = process.env.NODE_ENV === 'production'
  ? process.env.CLIENT_URL_PROD
  : process.env.CLIENT_URL_DEV;

// Route zum Abrufen aller Pakete
router.get('/packages', async (req, res) => {
  try {
    const packages = await Package.find();
    res.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Pakete' });
  }
});

// Route zum Erstellen einer Checkout-Session
router.post('/create-checkout-session', async (req, res) => {
  const { packageId, userId, selectedAddOns } = req.body;

  try {
    const packageItem = await Package.findById(packageId);
    if (!packageItem) {
      return res.status(404).json({ error: 'Paket nicht gefunden' });
    }

    // Basispreis berechnen
    let totalPrice = packageItem.price;

    // Preis für ausgewählte Add-ons hinzufügen
    if (selectedAddOns && selectedAddOns.length > 0) {
      selectedAddOns.forEach(addOnId => {
        const addOn = packageItem.addOns.find(a => a._id.toString() === addOnId);
        if (addOn) {
          totalPrice += addOn.price; // Preis des Add-ons hinzufügen
        }
      });
    }

    // Wenn das Paket kostenlos ist, den Benutzer direkt zur Bestätigungsseite weiterleiten
    if (totalPrice === 0) {
      // Hier können Sie die Logik implementieren, um das Paket sofort zu aktivieren
      await updateUserPackage(userId, packageId);
      return res.json({ message: 'Paket erfolgreich aktiviert!' });
    }

    // Erstellen der Checkout-Session nur für kostenpflichtige Pakete
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: packageItem.name,
            },
            unit_amount: Math.round(totalPrice * 100), // Gesamtpreis in Cent
          },
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/payment-success`,
      cancel_url: `${frontendUrl}/payment-cancel`,
      client_reference_id: userId,
      metadata: {
        packageId: packageId, // Zusätzliche Metadaten
      },
    });

    res.json({ sessionId: session.id }); // Rückgabe der Session-ID
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen der Checkout-Session' });
  }
});

// Webhook-Route zum Verarbeiten von Stripe Events
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
