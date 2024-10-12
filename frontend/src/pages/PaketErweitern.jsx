import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

// Ersetzen Sie dies durch Ihren tatsächlichen Stripe-Publishable-Key
const stripePromise = loadStripe('Ihr_Stripe_Publishable_Key');

const PaketErweitern = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get('/api/packages');
        setPackages(response.data);
        setLoading(false);
      } catch (err) {
        setError('Fehler beim Laden der Pakete. Bitte versuchen Sie es später erneut.');
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handlePackageSelection = async (packageId) => {
    try {
      const stripe = await stripePromise;
      const response = await axios.post('/api/create-checkout-session', {
        packageId,
        userId: user._id
      });

      const result = await stripe.redirectToCheckout({
        sessionId: response.data.sessionId
      });

      if (result.error) {
        setError(result.error.message);
      }
    } catch (err) {
      setError('Fehler bei der Verarbeitung Ihrer Anfrage. Bitte versuchen Sie es später erneut.');
    }
  };

  const PackageCard = ({ pkg }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-card p-6 rounded-lg shadow-lg"
    >
      <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
      <p className="text-gray-300 mb-4">{pkg.description}</p>
      <p className="text-2xl font-bold mb-4">{pkg.price} €</p>
      <button
        onClick={() => handlePackageSelection(pkg.id)}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
      >
        Jetzt kaufen
      </button>
    </motion.div>
  );

  if (loading) {
    return <Layout><div className="text-center">Laden...</div></Layout>;
  }

  if (error) {
    return <Layout><div className="text-center text-red-500">{error}</div></Layout>;
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8"
      >
        <h1 className="text-3xl font-bold text-center mb-8">Paket erweitern</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </motion.div>
    </Layout>
  );
};

export default PaketErweitern;