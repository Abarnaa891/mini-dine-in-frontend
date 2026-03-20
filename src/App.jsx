import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ToastProvider } from './components/Toast';

import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import MenuPage         from './pages/MenuPage';
import CartPage         from './pages/CartPage';
import OrdersPage       from './pages/OrdersPage';
import ReservationsPage from './pages/ReservationPage';

import DashboardPage         from './pages/DashboardPage';
import AdminMenuPage         from './pages/AdminMenuPage';
import AdminOrdersPage       from './pages/AdminOrdersPage';
import AdminReservationsPage from './pages/AdminReservationPage';
import AdminReportsPage      from './pages/AdminReportsPage';

import KitchenBoardPage from './pages/KitchenBoardPage';
import DeliveryPage     from './pages/DeliveryPage';
import ProtectedRoute   from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>

              {/* Public */}
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/"         element={<Navigate to="/login" replace />} />

              {/* Customer */}
              <Route path="/menu" element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}><MenuPage /></ProtectedRoute>
              } />
              <Route path="/cart" element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}><CartPage /></ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}><OrdersPage /></ProtectedRoute>
              } />
              <Route path="/reservations" element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}><ReservationsPage /></ProtectedRoute>
              } />

              {/* Admin */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['ADMIN']}><DashboardPage /></ProtectedRoute>
              } />
              <Route path="/admin/menu" element={
                <ProtectedRoute allowedRoles={['ADMIN']}><AdminMenuPage /></ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute allowedRoles={['ADMIN']}><AdminOrdersPage /></ProtectedRoute>
              } />
              <Route path="/admin/reservations" element={
                <ProtectedRoute allowedRoles={['ADMIN']}><AdminReservationsPage /></ProtectedRoute>
              } />
              <Route path="/admin/reports" element={
                <ProtectedRoute allowedRoles={['ADMIN']}><AdminReportsPage /></ProtectedRoute>
              } />

              {/* Kitchen */}
              <Route path="/kitchen" element={
                <ProtectedRoute allowedRoles={['KITCHEN', 'ADMIN']}><KitchenBoardPage /></ProtectedRoute>
              } />

              {/* Delivery */}
              <Route path="/delivery" element={
                <ProtectedRoute allowedRoles={['DELIVERY', 'ADMIN']}><DeliveryPage /></ProtectedRoute>
              } />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/login" replace />} />

            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>
    </Provider>
  );
}