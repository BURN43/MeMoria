import React from 'react';
import Layout from '../components/Layout';

const PaymentSuccessPage = () => {
  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Zahlung erfolgreich!</h1>
        <p>Vielen Dank für Ihren Kauf. Ihr Paket wurde erfolgreich erweitert.</p>
      </div>
    </Layout>
  );
};

export default PaymentSuccessPage;