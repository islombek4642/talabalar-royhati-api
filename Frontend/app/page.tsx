import Link from 'next/link';
import { 
  GraduationCap, 
  LogIn, 
  UserPlus, 
  Shield, 
  Zap, 
  Users, 
  BookOpen,
  Award,
  Clock,
  Github,
  Linkedin,
  Mail,
  Phone
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Talabalar Portali</span>
            </div>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Kirish
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Ro'yhatdan O'tish
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl md:text-7xl">
            Talabalar Portali
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            O'zingizning shaxsiy kabinetingizga xush kelibsiz. 
            Bu yerda siz profilingizni ko'rishingiz va boshqarishingiz mumkin.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg"
            >
              <UserPlus className="w-5 h-5" />
              Ro'yhatdan O'tish
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium text-indigo-600 bg-white rounded-lg hover:bg-gray-50 transition-all hover:scale-105 shadow-lg border-2 border-indigo-600"
            >
              <LogIn className="w-5 h-5" />
              Tizimga Kirish
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Imkoniyatlar
            </h2>
            <p className="text-lg text-gray-600">
              Talabalar uchun qulay va zamonaviy portal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Shaxsiy Profil
              </h3>
              <p className="text-gray-600">
                O'z ma'lumotlaringizni ko'ring va istalgan vaqt tahrirlang
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Xavfsizlik
              </h3>
              <p className="text-gray-600">
                Ma'lumotlaringiz shifrlangan va himoyalangan tizimda saqlanadi
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tez va Qulay
              </h3>
              <p className="text-gray-600">
                Zamonaviy texnologiyalar bilan yaratilgan qulay interfeys
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                O'quv Ma'lumotlari
              </h3>
              <p className="text-gray-600">
                Fakultet, guruh va o'qishga kirgan yil ma'lumotlari
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Profil Rasmingiz
              </h3>
              <p className="text-gray-600">
                Shaxsiy profil rasmingizni yuklash va o'zgartirish imkoniyati
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                24/7 Kirish
              </h3>
              <p className="text-gray-600">
                Istalgan vaqt va istalgan joydan o'z profilingizga kiring
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo va About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-6 h-6 text-indigo-400" />
                <span className="text-lg font-bold">Talabalar Portali</span>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Zamonaviy va xavfsiz talabalar boshqaruv tizimi. 
                Next.js, TypeScript va PostgreSQL bilan ishlab chiqilgan.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://github.com/islombek4642"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/islombek-hamidullayev-481354288/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Tezkor Havolalar</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-gray-300 hover:text-indigo-400 transition-colors text-sm flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Tizimga Kirish
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-gray-300 hover:text-indigo-400 transition-colors text-sm flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Ro'yhatdan O'tish
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="text-gray-400 hover:text-purple-400 transition-colors text-xs flex items-center gap-2 mt-4">
                    <Shield className="w-3 h-3" />
                    Admin Panel
                  </Link>
                </li>
              </ul>
            </div>

            {/* Developer */}
            <div>
              <h3 className="font-semibold mb-4">Dasturchi</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="font-medium text-white">Islombek Xamidullayev</li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  inamidullayev5@gmail.com
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +998 (90) 696-46-42
                </li>
              </ul>
            </div>

            {/* Tech Stack */}
            <div>
              <h3 className="font-semibold mb-4">Texnologiyalar</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-800 rounded-full text-xs">Next.js 16</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full text-xs">TypeScript</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full text-xs">PostgreSQL</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full text-xs">Express.js</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full text-xs">Prisma</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full text-xs">Docker</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full text-xs">Tailwind CSS</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2025 Islombek Xamidullayev. Barcha huquqlar himoyalangan.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
