import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './layout';
import './styles/global.scss'

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
  // {
  //   path: "login",
  //   element: <LoginPage />,
  // },
  // {
  //   path: "register",
  //   element: <RegisterPage />,
  // },

]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
