'use client';

import { useState } from 'react';
import { Activity, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

export default function MonitoringPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const grafanaUrl = 'http://localhost:3001';

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    // Force iframe reload
    const iframe = document.getElementById('grafana-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">System Monitoring</h1>
              <p className="text-xs text-gray-600">Grafana dashboard - real-time metrics</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Yangilash
            </button>
            <a
              href={grafanaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Yangi oynada
            </a>
          </div>
        </div>
      </div>

      {/* Grafana Iframe - Full Height */}
      <div className="flex-1 bg-white overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Grafana yuklanmoqda...</p>
            </div>
          </div>
        )}

        {hasError && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Grafana'ga ulanib bo'lmadi</h3>
              <p className="text-gray-600 mb-4">
                Grafana servisi ishlamayotgan bo'lishi mumkin. Docker container'larni tekshiring.
              </p>
              <div className="space-y-2 text-left bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-mono text-gray-700">
                  docker-compose ps
                </p>
                <p className="text-sm font-mono text-gray-700">
                  docker-compose logs grafana
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  Qayta urinish
                </button>
                <a
                  href={grafanaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <ExternalLink className="w-4 h-4" />
                  To'g'ridan-to'g'ri ochish
                </a>
              </div>
            </div>
          </div>
        )}

        <iframe
          id="grafana-iframe"
          src={grafanaUrl}
          className={`w-full h-full border-0 ${isLoading || hasError ? 'hidden' : ''}`}
          onLoad={handleLoad}
          onError={handleError}
          title="Grafana Monitoring Dashboard"
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
