import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet, RouterProvider, ScrollRestoration } from 'react-router-dom'
import { CartProvider } from './hooks/useCart'

// Each route is its own chunk: a QR scan downloads the menu, never the film.
const Home = lazy(() => import('./routes/Home'))
const MenuPage = lazy(() => import('./routes/MenuPage'))

function Shell() {
  return (
    <CartProvider>
      <Suspense fallback={<div className="route-loading" aria-busy="true" />}>
        <Outlet />
      </Suspense>
      <ScrollRestoration />
    </CartProvider>
  )
}

const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/menu', element: <MenuPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
