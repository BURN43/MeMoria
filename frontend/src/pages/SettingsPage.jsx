import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { Navigate } from "react-router-dom";
import io from "socket.io-client";
import ThemeSwitcher from "../components/ThemeSwitcher";

const API_URL =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_API_BASE_URL_DEV
    : import.meta.env.VITE_API_BASE_URL_PROD;

const defaultSettings = {
  albumTitle: "",
  eventDate: "",
  eventTime: "",
  greetingText: "",
  guestInfo: "",
  GuestUploadsImage: true,
  GuestUploadsVideo: true,
  Guestcomments: false,
  GuestDownloadOption: false,
  theme: "default",
};

const SettingsPage = () => {
  const { user } = useAuthStore();
  const [socket, setSocket] = useState(null);
  const [settings, setSettings] = useState(() => {
    const cachedSettings = localStorage.getItem("albumSettings");
    return cachedSettings ? JSON.parse(cachedSettings) : defaultSettings;
  });
  const [countdown, setCountdown] = useState(
    "Enter an event date to start the countdown",
  );
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    const handleReconnect = () => {
      fetchSettings(true);
    };

    newSocket.on("connect", handleReconnect);

    return () => {
      newSocket.off("connect", handleReconnect);
      newSocket.close();
    };
  }, []);

  const fetchSettings = useCallback(
    async (force = false) => {
      if (!force && !isLoading) return;
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/settings`, {
          withCredentials: true,
        });
        const settingsData = response.data;
        const formattedSettings = {
          ...settingsData,
          eventDate: settingsData.eventDate
            ? new Date(settingsData.eventDate).toISOString().split("T")[0]
            : "",
          theme: settingsData.theme || 'default',
        };
        if (JSON.stringify(formattedSettings) !== JSON.stringify(settings)) {
          setSettings(formattedSettings);
          localStorage.setItem("albumSettings", JSON.stringify(settingsData));
          document.documentElement.setAttribute("data-theme", formattedSettings.theme);
        }
      } catch (error) {
        setFeedbackMessage("Failed to fetch settings. Using cached data.");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, settings],
  );

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (socket) {
      const handleSettingsUpdate = (updatedSettings) => {
        const formattedSettings = {
          ...updatedSettings,
          eventDate: updatedSettings.eventDate
            ? new Date(updatedSettings.eventDate).toISOString().split("T")[0]
            : "",
        };

        if (JSON.stringify(formattedSettings) !== JSON.stringify(settings)) {
          setSettings(formattedSettings);
          localStorage.setItem(
            "albumSettings",
            JSON.stringify(updatedSettings),
          );
          setFeedbackMessage("Settings updated!");
          setTimeout(() => setFeedbackMessage(""), 3000);
        }
      };

      const handleSettingsDelete = () => {
        setSettings(defaultSettings);
        localStorage.removeItem("albumSettings");
        setFeedbackMessage("Settings have been deleted by an admin.");
        setTimeout(() => setFeedbackMessage(""), 3000);
      };

      socket.on("settings_updated", handleSettingsUpdate);
      socket.on("settings_deleted", handleSettingsDelete);

      return () => {
        socket.off("settings_updated", handleSettingsUpdate);
        socket.off("settings_deleted", handleSettingsDelete);
      };
    }
  }, [socket, settings]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setIsModified(true);
  }, []);

  const handleThemeChange = useCallback((newTheme) => {
    setSettings((prev) => ({ ...prev, theme: newTheme }));
    setIsModified(true);
    document.documentElement.setAttribute("data-theme", newTheme);
  }, []);

  const saveSettings = async () => {
    try {
      const response = await axios.put(`${API_URL}/api/settings`, settings, {
        withCredentials: true,
      });
      const updatedSettings = response.data;
      setSettings(updatedSettings);
      localStorage.setItem("albumSettings", JSON.stringify(updatedSettings));
      setFeedbackMessage("Settings saved successfully!");
      setTimeout(() => setFeedbackMessage(""), 3000);
      setIsModified(false);

      if (socket && socket.connected) {
        socket.emit("settings_updated", updatedSettings);
      }

      document.documentElement.setAttribute("data-theme", updatedSettings.theme);
    } catch (error) {
      setFeedbackMessage("Error saving settings. Please try again.");
    }
  };

  useEffect(() => {
    if (settings.eventDate) {
      const interval = setInterval(() => {
        const eventDateTime = settings.eventTime
          ? `${settings.eventDate}T${settings.eventTime}`
          : settings.eventDate;

        const eventTimeMs = new Date(eventDateTime).getTime();
        const currentTimeMs = new Date().getTime();
        const timeLeft = eventTimeMs - currentTimeMs;

        if (timeLeft > 0) {
          const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          );
          const minutes = Math.floor(
            (timeLeft % (1000 * 60 * 60)) / (1000 * 60),
          );
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setCountdown("The Event is Live!");
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCountdown("Enter an event date to start the countdown");
    }
  }, [settings.eventDate, settings.eventTime]);

  if (!user || user.role !== "admin") {
    return <Navigate to="/unauthorized" replace={true} />;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
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
          <h1 className="text-4xl font-bold mb-4 text-gradient">Album Settings</h1>
          <p className="text-lg text-secondary mb-6">
            Customize your album settings and manage the details for your event.
          </p>
          <div className="mb-4">
            <ThemeSwitcher 
              isAuthenticated={!!user} 
              currentTheme={settings.theme} 
              onThemeChange={handleThemeChange}
            />
          </div>
        </div>
        {feedbackMessage && (
          <div
            className={`text-center ${
              feedbackMessage.includes("Error") ? "text-error" : "text-green-500"
            } text-lg mb-4`}
          >
            {feedbackMessage}
          </div>
        )}
        <div className="bg-card p-8 rounded-xl shadow-lg max-w-3xl mx-auto mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-primary">Event and Album Details</h2>
          <div className="mb-4">
            <label className="block text-secondary text-sm mb-2">Title</label>
            <input
              type="text"
              name="albumTitle"
              value={settings.albumTitle || ""}
              onChange={handleInputChange}
              className="input uppercase"
              placeholder="Enter album title"
            />
          </div>
          <div className="mb-4">
            <label className="block text-secondary text-sm mb-2">Event Date</label>
            <input
              type="date"
              name="eventDate"
              value={settings.eventDate || ""}
              onChange={handleInputChange}
              className="input"
            />
          </div>
          <div className="mb-4">
            <label className="block text-secondary text-sm mb-2">
              Event Time (optional)
            </label>
            <input
              type="time"
              name="eventTime"
              value={settings.eventTime || ""}
              onChange={handleInputChange}
              className="input"
            />
          </div>
          {settings.eventDate && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-primary mb-2">Countdown to Event</h3>
              <div className="countdown-box">
                {countdown || "Enter an event date to start the countdown"}
              </div>
            </div>
          )}
          <div className="mb-4">
            <label className="block text-secondary text-sm mb-2">
              Greeting Text
            </label>
            <textarea
              name="greetingText"
              value={settings.greetingText || ""}
              onChange={handleInputChange}
              className="input"
              placeholder="Enter a greeting text for your guests"
              rows="3"
            />
          </div>
        </div>
        <div className="bg-card p-8 rounded-xl shadow-lg max-w-3xl mx-auto mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-primary">Additional Album Settings</h2>
          <div className="space-y-4">
            <Checkbox
              label="Allow Image Uploads"
              name="GuestUploadsImage"
              isChecked={settings.GuestUploadsImage}
              onChange={handleInputChange}
            />
            <Checkbox
              label="Allow Video Uploads"
              name="GuestUploadsVideo"
              isChecked={settings.GuestUploadsVideo}
              onChange={handleInputChange}
            />
            <Checkbox
              label="Enable Comments"
              name="Guestcomments"
              isChecked={settings.Guestcomments}
              onChange={handleInputChange}
            />
            <Checkbox
              label="Enable Download Options"
              name="GuestDownloadOption"
              isChecked={settings.GuestDownloadOption}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={saveSettings}
            disabled={!isModified}
            className={`button ${
              isModified ? "button-primary" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Save Settings
          </button>
        </div>
      </motion.div>
    </Layout>
  );
};

const Checkbox = React.memo(({ label, name, isChecked, onChange }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-secondary">{label}</span>
    <input
      type="checkbox"
      name={name}
      checked={isChecked}
      onChange={onChange}
      className="form-checkbox h-6 w-6 text-primary"
    />
  </div>
));

export default React.memo(SettingsPage);