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
// import { App } from 'antd';
// import { AppProvider } from 'components/context/app.context';
// import ProtectedRoute from '@/components/auth';
// import LayoutAdmin from './components/layout/layout.admin';
// import DashBoardPage from './pages/admin/dashboard';
// import ManageBookPage from './pages/admin/manage.book';
// import ManageOrderPage from './pages/admin/manage.order';
// import ManageUserPage from './pages/admin/manage.user';
// import { ConfigProvider } from "antd";
// import enUS from 'antd/locale/en_US';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    // children: [
    //   {
    //     index: true,
    //     path: "book",
    //     element: <BookPage />,
    //   },
    //   {
    //     path: "about",
    //     element: <AboutPage />,
    //   },
    //   {
    //     path: "checkout",
    //     element: (
    //       <ProtectedRoute>
    //         <div>checkout page</div>
    //       </ProtectedRoute>
    //     ),
    //   }

    // ]
  },
  // {
  //   path: "/admin",
  //   element: <LayoutAdmin />,
  //   children: [
  //     {
  //       index: true,
  //       element: (
  //         <ProtectedRoute>
  //           <DashBoardPage />
  //         </ProtectedRoute>
  //       ),
  //     },
  //     {
  //       path: "book",
  //       element: (
  //         <ProtectedRoute>
  //           <ManageBookPage />
  //         </ProtectedRoute>
  //       ),
  //     },
  //     {
  //       path: "order",
  //       element: (
  //         <ProtectedRoute>
  //           <ManageOrderPage />
  //         </ProtectedRoute>
  //       ),
  //     },
  //     {
  //       path: "user",
  //       element: (
  //         <ProtectedRoute>
  //           <ManageUserPage />
  //         </ProtectedRoute>
  //       ),
  //     }
  //   ]
  // },
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

]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
