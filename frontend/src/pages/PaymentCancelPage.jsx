import React from 'react';
import Layout from '../components/Layout';

const PaymentCancelPage = () => {
  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Zahlung abgebrochen</h1>
        <p>Ihre Zahlung wurde abgebrochen. Wenn Sie Fragen haben, kontaktieren Sie bitte unseren Support.</p>
      </div>
    </Layout>
  );
};

export default PaymentCancelPage;