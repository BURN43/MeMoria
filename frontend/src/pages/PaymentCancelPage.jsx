import React from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { XCircle, Mail, ArrowLeft } from 'lucide-react';

const PaymentCancelPage = () => {
  return (
    <Layout>
      <div className="text-center max-w-md mx-auto">
        <XCircle className="w-16 h-16 mx-auto mb-4 text-error" />
        <h1 className="text-3xl font-bold mb-4 text-primary">Zahlung abgebrochen</h1>
        <p className="text-secondary mb-6">Ihre Zahlung wurde abgebrochen. Wenn Sie Fragen haben, kontaktieren Sie bitte unseren Support.</p>
        <a href="mailto:info@semode.de" className="button button-secondary mb-4 inline-flex items-center justify-center">
          <Mail className="w-4 h-4 mr-2" />
          Kontaktieren Sie den Support
        </a>
        <Link to="/" className="flex items-center justify-center text-accent hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zur Startseite
        </Link>
      </div>
    </Layout>
  );
};

export default PaymentCancelPage;