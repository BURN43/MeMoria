import Stripe from 'stripe';
import { updateUserPackage } from '../services/userPackageService.js';

// Initialisieren des Stripe-Objekts mit dem geheimen Schlüssel
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  // Webhook-Signatur verifizieren
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Verarbeiten des checkout.session.completed Events
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const userId = session.client_reference_id; // Benutzer-ID aus den Metadaten
      const packageId = session.metadata.packageId; // Paket-ID aus den Metadaten

      // Benutzerpaket aktualisieren, bedingt auf dem Preis
      const totalPrice = session.amount_total / 100; // Gesamtpreis in Euro (Cents in Dollar umrechnen)

      // Wenn das Paket kostenlos ist, direkt aktivieren
      if (totalPrice === 0) {
        await updateUserPackage(userId, packageId);
        console.log(`Successfully updated package (free) for user ${userId}`);
      } else {
        // Bei kostenpflichtigen Paketen hier weitere Logik hinzufügen, falls benötigt
        await updateUserPackage(userId, packageId);
        console.log(`Successfully updated package for user ${userId}`);
      }
    } catch (error) {
      console.error('Error processing successful payment:', error);
      return res.status(500).send('Error processing payment');
    }
  }

  // Antworten, dass das Ereignis empfangen wurde
  res.json({ received: true });
};