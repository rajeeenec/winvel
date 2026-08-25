import { Routes, Route } from 'react-router-dom';
import UserLayout from '../layouts/UserLayout';
import HomePage from '../pages/user/HomePage';
import ShopPage from '../pages/user/ShopPage';
import ProductDetailPage from '../pages/user/ProductDetailPage';
import CartPage from '../pages/user/CartPage';
import OrdersPage from '../pages/user/OrdersPage';
import LoginPage from '../pages/shared/LoginPage';
import RegisterPage from '../pages/shared/RegisterPage';
import ForgotPasswordPage from '../pages/shared/ForgotPasswordPage';

export default function UserRoutes() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="product/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
      </Route>
    </Routes>
  );
}
