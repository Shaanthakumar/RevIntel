import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

import Dashboard from './pages/Dashboard';
import DataManagement from './pages/DataManagement';
import RevenueAnalytics from './pages/RevenueAnalytics';
import Bookings from './pages/Bookings';
import CustomerAnalytics from './pages/CustomerAnalytics';
import Anomalies from './pages/Anomalies';
import Forecasting from './pages/Forecasting';
import DynamicPricing from './pages/DynamicPricing';
import InventoryAllocation from './pages/InventoryAllocation';
import AIRevenueAgent from './pages/AIRevenueAgent';
import Alerts from './pages/Alerts';
import RecommendationHistory from './pages/RecommendationHistory';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="data" element={<DataManagement />} />
          <Route path="analytics" element={<RevenueAnalytics />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="customers" element={<CustomerAnalytics />} />
          <Route path="anomalies" element={<Anomalies />} />
          <Route path="forecasting" element={<Forecasting />} />
          <Route path="pricing" element={<DynamicPricing />} />
          <Route path="inventory" element={<InventoryAllocation />} />
          <Route path="agent" element={<AIRevenueAgent />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="recommendations" element={<RecommendationHistory />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
