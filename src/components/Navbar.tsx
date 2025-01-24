import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  //Hide navbar on login or register page
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <nav className="bg-blue-500 text-white py-4 px-6 flex justify-between items-center">
      <div className="font-bold text-lg">
        <Link to="/dashboard">My App</Link>
      </div>
      <ul className="flex space-x-4">
        <li>
          <Link to="/dashboard" className="hover:underline">
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/profile" className="hover:underline">
            Profile
          </Link>
        </li>
        <li>
          <Link to="/logout" className="hover:underline">
            Logout
          </Link>
        </li>
      </ul>
    </nav>
  );
};
