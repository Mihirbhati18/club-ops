import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from 'sonner';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // Add dark class to html element for dark theme
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster 
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#1f2937',
            border: '1px solid #374151',
            color: '#fff',
          },
        }}
      />
    </>
  );
}