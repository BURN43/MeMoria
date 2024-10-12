import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import Package from '../models/Package.js';

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.get('/packages', async (req, res) => {
  try {
    const packages = await Package.find();
    res.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Pakete' });
  }
});

router.post('/create-checkout-session', async (req, res) => {
  const { packageId, userId } = req.body;

  try {
    const packageItem = await Package.findById(packageId);
    if (!packageItem) {
      return res.status(404).json({ error: 'Paket nicht gefunden' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: packageItem.name,
            },
            unit_amount: Math.round(packageItem.price * 100), // Preis in Cent
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      client_reference_id: userId,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen der Checkout-Session' });
  }
});

export default router;