import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Page not found</h1>
      <p className="text-lg text-gray-600 mb-8">
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-block px-6 py-3 bg-[#e9c46a] text-white font-medium rounded-lg hover:bg-[#f0cc74] shadow-[0_4px_0_0_#b8862a] active:shadow-none active:translate-y-[4px] cursor-pointer inline-block text-center transition-colors duration-300"
      >
        Back to Home
      </Link>
    </div>
  );
}
