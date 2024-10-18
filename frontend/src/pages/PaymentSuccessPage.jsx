import React from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';

const PaymentSuccessPage = () => {
  return (
    <Layout>
      <div className="text-center max-w-md mx-auto">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold mb-4 text-primary">Zahlung erfolgreich!</h1>
        <p className="text-secondary mb-6">Vielen Dank für Ihren Kauf. Ihr Paket wurde erfolgreich erweitert.</p>
        <Link to="/dashboard" className="button button-primary mb-4 inline-flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zum Dashboard
        </Link>
      </div>
    </Layout>
  );
};

export default PaymentSuccessPage;