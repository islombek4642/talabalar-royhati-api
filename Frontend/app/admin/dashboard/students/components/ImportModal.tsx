'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportModal({ onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Faqat CSV fayllar qabul qilinadi');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Iltimos CSV faylni tanlang');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setError('Token topilmadi. Qayta login qiling.');
        setLoading(false);
        return;
      }

      console.log('[Import] Starting import...', { fileName: file.name, fileSize: file.size });
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3000/api/v1/students/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('[Import] Response status:', response.status);

      if (!response.ok) {
        const data = await response.json();
        console.error('[Import] Error response:', data);
        throw new Error(data.error?.message || 'Import failed');
      }

      const result = await response.json();
      console.log('[Import] Success result:', result);
      
      const insertedCount = (result.inserted || 0) - (result.restored || 0);
      const restoredCount = result.restored || 0;
      
      let message = `✅ ${result.inserted || 0} ta talaba import qilindi!`;
      if (restoredCount > 0) {
        message = `✅ ${insertedCount} ta yangi + ${restoredCount} ta qayta tiklandi = ${result.inserted} ta talaba!`;
      }
      const invalidMsg = result.invalid > 0 ? ` (${result.invalid} ta xato)` : '';
      const duplicateMsg = result.duplicates > 0 ? ` ${result.duplicates} ta dublikat topildi` : '';
      setSuccess(message + invalidMsg + duplicateMsg);
      
      // Always refresh table first
      onSuccess();
      
      if (result.duplicates > 0 && result.duplicateList && result.duplicateList.length > 0) {
        console.log('Duplicates found:', result.duplicateList); // Debug log
        setDuplicates(result.duplicateList);
        // Don't auto-close if there are duplicates - user must close manually
      } else {
        console.log('No duplicates, auto-closing in 3s'); // Debug log
        // Auto-close after 3 seconds if no duplicates
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Import xatolik');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'full_name,email,phone,faculty,group,birth_date,enrollment_year\n' +
                      'Islombek Xamidullayev,test@example.com,+998901234567,IT,ISE-N23-UA,2000-01-01,2023\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">CSV Import</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">CSV Format:</p>
                <p className="text-xs">
                  full_name, email, phone, faculty, group, birth_date, enrollment_year
                </p>
              </div>
            </div>
          </div>

          {/* Download Template */}
          <button
            onClick={downloadTemplate}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-gray-600 hover:text-indigo-600"
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">Template Yuklab Olish</span>
          </button>

          {/* File Upload */}
          <div className="space-y-2">
            <input
              id="csv-file-upload"
              name="csv_file"
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">
                {file ? file.name : 'CSV Fayl Tanlash'}
              </span>
            </button>

            {file && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <FileText className="w-4 h-4" />
                <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Duplicates List */}
          {duplicates.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">Dublikat Talabalar:</h4>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {duplicates.map((dup, idx) => (
                  <div key={idx} className="text-sm text-yellow-700 flex items-center gap-2 py-1">
                    <span className="w-1 h-1 bg-yellow-600 rounded-full"></span>
                    <span className="font-medium">{dup.full_name}</span>
                    <span className="text-yellow-600">({dup.email})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Import qilinmoqda...' : 'Import Qilish'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Bekor Qilish
          </button>
        </div>
      </div>
    </div>
  );
}
