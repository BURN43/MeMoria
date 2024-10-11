import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuthStore } from '../store/authStore'; // Assuming this hook provides user data
import { Navigate } from 'react-router-dom'; // Import for navigation

const DesignTableStandPage = () => {
  const { user } = useAuthStore();
  const [albumToken, setAlbumToken] = useState('');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [qrCodeSize, setQrCodeSize] = useState(250);
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    if (user && user.albumToken) {
      setAlbumToken(user.albumToken);
    }
  }, [user]);

  const albumLink = `https://e7ea99a1-f3aa-439b-97db-82d9e87187ed-00-1etsckkyhp4f3.spock.replit.dev:5173/album/?token=${albumToken}`;

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQRCodeDownload = () => {
    const canvas = document.querySelector('canvas');
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'album-qr-code.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(albumLink);
    alert('Link copied to clipboard!');
  };

  // Redirect or deny access if the user is not an admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />; // Alternatively, show a message: return <div>Access Denied: Admins only</div>;
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 md:p-8 pb-20"
      >
        {/* Intro Section */}
        <div className="text-center max-w-2xl mx-auto mb-8 mt-10">
          <h1 className="text-4xl font-extrabold mb-6 text-gradient">
            Design Your Table Stand QR Code
          </h1>
          <p className="text-lg text-gray-300">
            Customize the QR code for your event's table stand. Use the generated code to allow guests to easily access your album.
          </p>
        </div>

        {/* QR Code Customization Block */}
        <div className="bg-gray-800 rounded-xl p-8 shadow-lg max-w-3xl mx-auto mb-8">
          <h2 className="text-2xl text-gray-200 font-bold mb-6">QR Code Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div>
              <label className="block text-lg text-gray-300 mb-2 font-medium">Foreground Color</label>
              <input
                type="color"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                className="w-full py-3 px-4 bg-gray-700 text-white rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-lg text-gray-300 mb-2 font-medium">QR Code Size</label>
              <input
                type="range"
                min="100"
                max="500"
                value={qrCodeSize}
                onChange={(e) => setQrCodeSize(e.target.value)}
                className="w-full"
              />
              <p className="text-gray-300 text-sm mt-1">Size: {qrCodeSize}px</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-lg text-gray-300 mb-2 font-medium">Upload Logo</label>
              <input
                type="file"
                onChange={handleLogoUpload}
                className="w-full py-3 px-4 bg-gray-700 text-white rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-center items-center">
            <QRCodeCanvas
              value={albumLink}
              size={parseInt(qrCodeSize)}
              fgColor={foregroundColor}
              imageSettings={
                logo
                  ? {
                      src: logo,
                      height: 50,
                      width: 50,
                      excavate: true,
                    }
                  : undefined
              }
              className="mb-6"
            />
          </div>

          {/* Album Link with Copy Function */}
          <div className="text-center mb-6">
            <p className="text-gray-300 mb-2">Shareable Link:</p>
            <div className="flex justify-center items-center gap-2">
              <input
                type="text"
                value={albumLink}
                readOnly
                className="py-2 px-4 w-full max-w-md bg-gray-700 text-white rounded-lg"
              />
              <button
                onClick={handleCopyLink}
                className="button bg-blue-500 hover:bg-blue-600"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleQRCodeDownload}
              className="button bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
            >
              Download QR Code
            </button>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default DesignTableStandPage;