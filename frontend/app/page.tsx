import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            Welcome to Solace-AI
          </h1>
          <p className="text-xl text-gray-600">
            Your empathetic voice companion for emotional support
          </p>
        </div>
        
        <div className="space-y-4 pt-8">
          <p className="text-gray-700 leading-relaxed">
            Experience compassionate conversations with an AI that understands your emotions
            and provides support whenever you need it.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link
            href="/login"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg text-lg"
          >
            Login
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors text-lg"
          >
            Sign Up
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 transition-colors text-lg"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
