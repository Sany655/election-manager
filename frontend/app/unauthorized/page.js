"use client";
import { useRouter } from "next/navigation";
import { FaLock, FaHome, FaArrowLeft, FaExclamationTriangle } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center border border-red-100 dark:border-red-900">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
            <FaLock className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>

          {/* Error Code */}
          <div className="mb-4">
            <span className="inline-block bg-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold tracking-wider">
              ERROR 403
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Sorry, you don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleGoBack}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <FaArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <FaHome className="w-4 h-4" />
              Go to Dashboard
            </Button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                Need Access?
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Contact your system administrator to request the necessary permissions for this resource.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If you continue to experience issues, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}