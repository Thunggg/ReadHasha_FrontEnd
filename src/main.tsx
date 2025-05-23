import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Layout from '@/layout'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
// import BookPage from 'pages/client/book';
// import AboutPage from 'pages/client/about';
// import LoginPage from 'pages/client/auth/login';
// import RegisterPage from 'pages/client/auth/register';
import 'styles/global.scss'
import RegisterPage from 'pages/client/auth/Register/register';
import VerifyEmail from 'pages/client/auth/Register/VerifyEmail';
import RegisterLayout from './Layout/RegisterLayout';
import LoginPage from './pages/client/auth/Login/login';
import { App, ConfigProvider } from 'antd';
import { AppProvider } from 'components/context/app.context';
import ProtectedRoute from '@/components/auth';
import ManageBookPage from './pages/admin/manage.book';
import ManageOrderPage from './pages/admin/manage.order';
import ManageUserPage from './pages/admin/manage.user';
import LayoutAdmin from './Layout/admin/layout.admin';
// import { App } from 'antd';
// import { AppProvider } from 'components/context/app.context';
// import ProtectedRoute from '@/components/auth';
// import LayoutAdmin from './components/layout/layout.admin';
// import DashBoardPage from './pages/admin/dashboard';
// import ManageBookPage from './pages/admin/manage.book';
// import ManageOrderPage from './pages/admin/manage.order';
// import ManageUserPage from './pages/admin/manage.user';
// import { ConfigProvider } from "antd";
import viVN from 'antd/locale/vi_VN';
import HomePage from './pages/client/home';
import BookPage from './pages/client/book';
import OrderPage from './pages/client/order';
import HistoryPage from './pages/client/history';
import ManageCategoryPage from './pages/admin/manage.category';
import EmailVerificationPage from './pages/client/auth/forgotPassword/forgotPassword';
import VerifyEmailForgotPassword from './pages/client/auth/forgotPassword/verifyEmailForForgotPassword';
import ResetPassword from './pages/client/auth/forgotPassword/ResetPassword';
import { ForgotPasswordProvider } from './components/context/ForgotPassword.context';
import ProtectedRouteForgotPassword from './components/auth/ProtectedRouteForgotPassword';
import ManagePromotionPage from './pages/admin/manage.promotion';
import DashBoardPage from './components/admin/dashboard';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/book/:id",
        element: <BookPage />,
      },
      {
        path: "/order",
        element: (
          <ProtectedRoute>
            <OrderPage />
          </ProtectedRoute>
        )
      },
      {
        path: "/history",
        element: (
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "about",
        element: <div>about page</div>,
      },
      {
        path: "checkout",
        element: (
          <ProtectedRoute>
            <div>checkout page</div>
          </ProtectedRoute>
        ),
      }
    ]
  },
  {
    path: "/admin",
    element: <LayoutAdmin />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <DashBoardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "book",
        element: (
          <ProtectedRoute>
            <ManageBookPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "order",
        element: (
          <ProtectedRoute>
            <ManageOrderPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "user",
        element: (
          <ProtectedRoute>
            <ManageUserPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "category",
        element: (
          <ProtectedRoute>
            <ManageCategoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "promotion",
        element: (
          <ProtectedRoute>
            <ManagePromotionPage />
          </ProtectedRoute>
        ),
      }
    ]
  },
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterLayout />,
    children: [
      {
        index: true,
        element: <RegisterPage />
      },
      {
        path: "verifyEmail",
        element: <VerifyEmail />
      }
    ]
  },
  {
    path: "/forgot-password",
    element: <RegisterLayout />,
    children: [
      {
        index: true,
        element: <EmailVerificationPage />
      },
      {
        path: "verifyEmail",
        element: (
          <ProtectedRouteForgotPassword>
            <VerifyEmailForgotPassword />
          </ProtectedRouteForgotPassword>
        ),
      },
      {
        path: "reset-password",
        element: (
          <ProtectedRouteForgotPassword>
            <ResetPassword />
          </ProtectedRouteForgotPassword>
        ),
      }
    ]
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App>
      <AppProvider>
        <ConfigProvider locale={viVN}>
          <ForgotPasswordProvider>
            <RouterProvider router={router} />
          </ForgotPasswordProvider>
        </ConfigProvider>
      </AppProvider>
    </App>
  </StrictMode>,
)
