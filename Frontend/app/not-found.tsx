'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-indigo-600">404</h1>
          <h2 className="text-3xl font-semibold text-gray-900 mt-4">Sahifa Topilmadi</h2>
          <p className="text-gray-600 mt-2 max-w-md mx-auto">
            Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki o'chirilgan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Bosh Sahifa
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Orqaga
          </button>
        </div>

        <div className="mt-12">
          <p className="text-sm text-gray-500">
            Agar muammo davom etsa,{' '}
            <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700 underline">
              Dashboard
            </Link>
            {' '}ga qayting
          </p>
        </div>
      </div>
    </div>
  );
}
