import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';


const DesignTableStandPage = () => {
  const { user } = useAuthStore();
  const [albumToken, setAlbumToken] = useState('');
  const [foregroundColor, setForegroundColor] = useState(() => {
    return localStorage.getItem('qrCodeForegroundColor') || '#000000';
  });
  const [qrCodeSize, setQrCodeSize] = useState(() => {
    return parseInt(localStorage.getItem('qrCodeSize') || '250', 10);
  });
  const [logo, setLogo] = useState(null);
  const [QRCodeCanvas, setQRCodeCanvas] = useState(null);

  useEffect(() => {
    // Dynamisch `qrcode.react` laden
    import('qrcode.react').then((module) => {
      setQRCodeCanvas(() => module.QRCodeCanvas);
    });
  }, []);

  useEffect(() => {
    if (user && user.albumToken) {
      setAlbumToken(user.albumToken);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('qrCodeForegroundColor', foregroundColor);
  }, [foregroundColor]);

  useEffect(() => {
    localStorage.setItem('qrCodeSize', qrCodeSize.toString());
  }, [qrCodeSize]);

  const albumLink = useMemo(() => {
    const frontendUrl = import.meta.env.MODE === 'development'
      ? import.meta.env.VITE_API_BASE_URL_DEV
      : import.meta.env.VITE_API_BASE_URL_PROD;

    return `${frontendUrl}/album/?token=${albumToken}`;
  }, [albumToken]);

  const handleLogoUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleQRCodeDownload = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'album-qr-code.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  }, []);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(albumLink);
    alert('Link copied to clipboard!');
  }, [albumLink]);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 md:p-8 pb-20"
      >
        <div className="text-center max-w-2xl mx-auto mb-8 mt-10">
          <h1 className="text-4xl font-extrabold mb-6 text-gradient">
            Design Your Table Stand QR Code
          </h1>
          <p className="text-lg text-gray-300">
            Customize the QR code for your event's table stand. Use the generated code to allow guests to easily access your album.
          </p>
        </div>

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
                onChange={(e) => setQrCodeSize(parseInt(e.target.value, 10))}
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
            {QRCodeCanvas && (
              <QRCodeCanvas
                value={albumLink}
                size={qrCodeSize}
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
            )}
          </div>

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

export default React.memo(DesignTableStandPage);
