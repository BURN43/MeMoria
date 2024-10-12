// controllers/stripeWebhookController.js
import Stripe from 'stripe';
import { updateUserPackage } from '../services/userPackageService.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const userId = session.client_reference_id;
      const packageId = session.metadata.packageId;

      await updateUserPackage(userId, packageId);

      console.log(`Successfully updated package for user ${userId}`);
    } catch (error) {
      console.error('Error processing successful payment:', error);
      return res.status(500).send('Error processing payment');
    }
  }

  res.json({received: true});
};