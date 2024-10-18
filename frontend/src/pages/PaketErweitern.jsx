import React, { useState, useEffect } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

// Option 1: Direct backend URL in development
const API_URL = import.meta.env.MODE === 'development'
  ? import.meta.env.VITE_API_URL_BASE_WITH_API_DEV // Development URL
  : import.meta.env.VITE_API_URL_BASE_WITH_API_PROD; // Production URL

const PaketErweitern = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();
  const stripe = useStripe();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(`${API_URL}/stripe/packages`);
        setPackages(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError('Fehler beim Laden der Pakete. Bitte versuchen Sie es später erneut.');
        setLoading(false);
        toast.error('Fehler beim Laden der Pakete');
      }
    };

    fetchPackages();
  }, []);

  const handlePackageSelection = async (packageId, selectedAddOns) => {
    if (!stripe) {
      toast.error('Stripe ist noch nicht geladen');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/stripe/create-checkout-session`, {
        packageId,
        userId: user._id,
        selectedAddOns,
      });

      const result = await stripe.redirectToCheckout({
        sessionId: response.data.sessionId,
      });

      if (result.error) {
        setError(result.error.message);
        toast.error(result.error.message);
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError('Fehler bei der Verarbeitung Ihrer Anfrage. Bitte versuchen Sie es später erneut.');
      toast.error('Fehler bei der Verarbeitung Ihrer Anfrage');
    }
  };

  const PackageCard = ({ pkg }) => {
    const [selectedAddOns, setSelectedAddOns] = useState([]);

    const handleAddOnChange = (addOn) => {
      if (selectedAddOns.includes(addOn)) {
        setSelectedAddOns(selectedAddOns.filter(item => item !== addOn));
      } else {
        setSelectedAddOns([...selectedAddOns, addOn]);
      }
    };

    return (
      <motion.div
        whileHover={{ scale: 1.03 }}
        className="bg-card rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-2xl font-bold text-primary mb-2">{pkg.name}</h3>
        <p className="text-3xl font-bold text-accent mb-4">{pkg.price} €</p>
        <p className="text-secondary mb-4">{pkg.description}</p>
        <ul className="space-y-2 mb-6">
          {[
            { label: 'Fotos & Videos', value: pkg.features.photoLimit === -1 ? 'Unbegrenzt' : `Bis zu ${pkg.features.photoLimit}` },
            { label: 'Alben', value: pkg.features.albumCount },
            { label: 'Speicherdauer', value: `${pkg.features.storageDuration} Monate` },
            { label: 'Vollständige Album-Downloads', value: pkg.features.fullAlbumDownloads },
            { label: 'Gästeanzahl', value: pkg.features.guestLimit === -1 ? 'Unbegrenzt' : `Bis zu ${pkg.features.guestLimit}` },
            { label: 'Like Funktion', value: pkg.features.likeFunction },
            { label: 'Kommentar Funktion', value: pkg.features.commentFunction },
            { label: 'Foto Challenges', value: pkg.features.photoChallenges },
            { label: 'Bilder & Videos in voller Qualität', value: pkg.features.fullQualityImages }
          ].map(({ label, value }, index) => (
            <li key={index} className="flex items-start">
              {typeof value === 'boolean' ? (
                value ? (
                  <FaCheckCircle className="text-green-500 mr-2 mt-1" />
                ) : (
                  <FaTimesCircle className="text-red-500 mr-2 mt-1" />
                )
              ) : (
                <FaCheckCircle className="text-green-500 mr-2 mt-1" />
              )}
              <span>
                <strong>{label}:</strong> {typeof value === 'boolean' ? '' : value}
              </span>
            </li>
          ))}
        </ul>
        {pkg.addOns && pkg.addOns.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-primary mb-2">Verfügbare Add-ons:</h4>
            <ul className="space-y-2">
              {pkg.addOns.map((addon) => (
                <li key={addon._id} className="flex flex-col">
                  <div className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2" />
                    <strong>{addon.name}:</strong>
                    <span className="ml-1 font-semibold">{addon.price} €</span>
                  </div>
                  <p className="text-secondary ml-6">{addon.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={() => handlePackageSelection(pkg._id, selectedAddOns)}
          className="button button-primary w-full"
        >
          {pkg.price > 0 ? 'Jetzt upgraden' : 'Kostenlos starten'}
        </button>
      </motion.div>
    );
    };
    if (loading) {
    return <Layout><div className="text-center text-lg text-secondary">Laden...</div></Layout>;
    }
    if (error) {
    return <Layout><div className="text-center text-lg text-error">{error}</div></Layout>;
    }
    return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 md:p-8 pb-20"
      >
        <h1 className="text-4xl font-bold text-center text-gradient mb-8">Wählen Sie Ihr Paket</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <PackageCard key={pkg._id} pkg={pkg} />
          ))}
        </div>
      </motion.div>
    </Layout>
    );
    };
export default PaketErweitern;
