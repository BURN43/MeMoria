import React, { useState, useEffect } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const API_BASE_URL = 'https://e7ea99a1-f3aa-439b-97db-82d9e87187ed-00-1etsckkyhp4f3.spock.replit.dev:5000';

const PaketErweitern = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();
  const stripe = useStripe();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/stripe/packages`);
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

  const handlePackageSelection = async (packageId) => {
    if (!stripe) {
      toast.error('Stripe ist noch nicht geladen');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
        packageId,
        userId: user._id
      });

      const result = await stripe.redirectToCheckout({
        sessionId: response.data.sessionId
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

  const PackageCard = ({ pkg }) => (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="package-card"
    >
      <h3 className="package-title">{pkg.name}</h3>
      <p className="package-price">{pkg.price} €</p>
      <p className="package-description">{pkg.description}</p>
      <ul className="package-features">
        <li>
          <FaCheckCircle className="feature-icon feature-available" />
          <strong>Fotos & Videos: </strong> {pkg.features.photoLimit === -1 ? ' Unbegrenzt ' : ` Bis zu ${pkg.features.photoLimit}`}
        </li>
        <li>
          <FaCheckCircle className="feature-icon feature-available" />
          <strong>Alben: </strong> {pkg.features.albumCount}
        </li>
        <li>
          <FaCheckCircle className="feature-icon feature-available" />
          <strong>Speicherdauer: </strong> {pkg.features.storageDuration} Monate
        </li>
        <li>
          <FaCheckCircle className="feature-icon feature-available" />
          <strong>Vollständige Album-Downloads: </strong> {pkg.features.fullAlbumDownloads}
        </li>
        <li>
          <FaCheckCircle className="feature-icon feature-available" />
          <strong>Gästeanzahl: </strong> {pkg.features.guestLimit === -1 ? 'Unbegrenzt' : `Bis zu ${pkg.features.guestLimit}`}
        </li>
        <li>
          {pkg.features.likeFunction ? 
            <FaCheckCircle className="feature-icon feature-available" /> : 
            <FaTimesCircle className="feature-icon feature-unavailable" />
          }
          <strong>Like Funktion</strong>
        </li>
        <li>
          {pkg.features.commentFunction ? 
            <FaCheckCircle className="feature-icon feature-available" /> : 
            <FaTimesCircle className="feature-icon feature-unavailable" />
          }
          <strong>Kommentar Funktion</strong>
        </li>
        <li>
          {pkg.features.photoChallenges ? 
            <FaCheckCircle className="feature-icon feature-available" /> : 
            <FaTimesCircle className="feature-icon feature-unavailable" />
          }
          <strong>Foto Challenges</strong>
        </li>
        <li>
          {pkg.features.fullQualityImages ? 
            <FaCheckCircle className="feature-icon feature-available" /> : 
            <FaTimesCircle className="feature-icon feature-unavailable" />
          }
          <strong>Bilder in voller Qualität</strong>
        </li>
      </ul>
      {pkg.addOns && pkg.addOns.length > 0 && (
        <div className="package-addons">
          <h4>Verfügbare Add-ons:</h4>
          <ul>
            {pkg.addOns.map((addon, index) => (
              <li key={index}>
                <FaCheckCircle className="feature-icon feature-available" />
                <strong>{addon.name}:</strong> {addon.price} €
                <p>{addon.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={() => handlePackageSelection(pkg._id)}
        className="package-button"
      >
        {pkg.price > 0 ? 'Jetzt upgraden' : 'Kostenlos starten'}
      </button>
    </motion.div>
  );

  if (loading) {
    return <Layout><div className="loading-message">Laden...</div></Layout>;
  }

  if (error) {
    return <Layout><div className="error-message">{error}</div></Layout>;
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="packages-container"
      >
        <h1 className="page-title">Wählen Sie Ihr Paket</h1>
        <div className="packages-grid">
          {packages.map((pkg) => (
            <PackageCard key={pkg._id} pkg={pkg} />
          ))}
        </div>
      </motion.div>
    </Layout>
  );
};

export default PaketErweitern;