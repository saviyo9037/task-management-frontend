import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted-t px-4">
      <div className="text-center">
        <p className="text-8xl font-black text-gray-100">404</p>
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-primary-t">Page not found</h1>
          <p className="mt-2 text-sm text-secondary-t">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:bg-violet-700"
        >
          <Home className="h-4 w-4" />
          Go home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
