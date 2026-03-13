// components/Product/SizeChartModal.jsx
import React, { useState } from 'react';
import { X, Ruler, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const SizeChartModal = ({ isOpen, onClose, variant, productName, clothingType }) => {
  const [unit, setUnit] = useState('inches');
  const [showGuide, setShowGuide] = useState(true);
  
  if (!isOpen || !variant?.sizeDetails) return null;

  // ============ SAMPLE DATA - Multiple Sizes ke liye ============
  const sizeChartData = {
    "S": { chest: 38, length: 25, shoulder: 18, sleeve: 22, hips: 40 },
    "M": { chest: 40, length: 26, shoulder: 19, sleeve: 22.5, hips: 42 },
    "L": { chest: 42, length: 27, shoulder: 18, sleeve: 23, hips: 44 },
    "XL": { chest: 44, length: 28, shoulder: 19, sleeve: 23.5, hips: 46 }
  };

  // ============ GET TABLE HEADERS ============
  const headers = [
    { key: 'size', label: 'Size' },
    { key: 'chest', label: 'Chest (in)' },
    { key: 'length', label: 'Front Length (in)' },
    { key: 'shoulder', label: 'Across Shoulder (in)' },
    { key: 'sleeve', label: 'Sleeve-Length (in)' },
    { key: 'hips', label: 'Hips (in)' }
  ];

  // ============ T-SHIRT DIAGRAM COMPONENT ============
  const TShirtDiagram = () => (
    <div className="relative w-full h-64 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
      {/* T-Shirt Outline */}
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* T-Shirt Body */}
        <path 
          d="M100 50 L200 50 L220 90 L220 200 L150 230 L80 200 L80 90 L100 50" 
          fill="none" 
          stroke="#333" 
          strokeWidth="2"
          className="dark:stroke-gray-400"
        />
        
        {/* Neck/Collar */}
        <path 
          d="M135 50 Q150 35,165 50" 
          fill="none" 
          stroke="#333" 
          strokeWidth="2"
          className="dark:stroke-gray-400"
        />
        
        {/* Sleeves */}
        <path 
          d="M100 50 L70 90" 
          fill="none" 
          stroke="#333" 
          strokeWidth="2"
          className="dark:stroke-gray-400"
        />
        <path 
          d="M200 50 L230 90" 
          fill="none" 
          stroke="#333" 
          strokeWidth="2"
          className="dark:stroke-gray-400"
        />

        {/* ============ MEASUREMENT LINES ============ */}

        {/* Shoulder Line */}
        <line 
          x1="100" y1="50" 
          x2="200" y2="50" 
          stroke="#ef4444" 
          strokeWidth="2" 
          strokeDasharray="5,5"
        />
        <text 
          x="150" y="40" 
          fontSize="12" 
          fill="#ef4444" 
          textAnchor="middle"
          className="font-medium"
        >
          Shoulder
        </text>

        {/* Chest Line */}
        <line 
          x1="80" y1="100" 
          x2="220" y2="100" 
          stroke="#3b82f6" 
          strokeWidth="2" 
          strokeDasharray="5,5"
        />
        <text 
          x="150" y="90" 
          fontSize="12" 
          fill="#3b82f6" 
          textAnchor="middle"
          className="font-medium"
        >
          Chest
        </text>

        {/* Waist Line */}
        <line 
          x1="85" y1="150" 
          x2="215" y2="150" 
          stroke="#8b5cf6" 
          strokeWidth="2" 
          strokeDasharray="5,5"
        />
        <text 
          x="150" y="140" 
          fontSize="12" 
          fill="#8b5cf6" 
          textAnchor="middle"
          className="font-medium"
        >
          Waist
        </text>

        {/* Hips Line */}
        <line 
          x1="90" y1="200" 
          x2="210" y2="200" 
          stroke="#ec4899" 
          strokeWidth="2" 
          strokeDasharray="5,5"
        />
        <text 
          x="150" y="190" 
          fontSize="12" 
          fill="#ec4899" 
          textAnchor="middle"
          className="font-medium"
        >
          Hips
        </text>

        {/* Length Line */}
        <line 
          x1="230" y1="50" 
          x2="230" y2="220" 
          stroke="#22c55e" 
          strokeWidth="2" 
          strokeDasharray="5,5"
        />
        <text 
          x="245" y="135" 
          fontSize="12" 
          fill="#22c55e" 
          transform="rotate(90, 245, 135)"
          className="font-medium"
        >
          Length
        </text>

        {/* Sleeve Line */}
        <line 
          x1="220" y1="90" 
          x2="250" y2="120" 
          stroke="#f97316" 
          strokeWidth="2" 
          strokeDasharray="5,5"
        />
        <text 
          x="260" y="100" 
          fontSize="12" 
          fill="#f97316" 
          className="font-medium"
        >
          Sleeve
        </text>
      </svg>
    </div>
  );

  // ============ MEASUREMENT TIPS ============
  const measurementTips = [
    { name: 'Collar', desc: 'Measure around the base of your neck', color: 'gray' },
    { name: 'Chest', desc: 'Measure around the fullest part of your chest', color: 'blue' },
    { name: 'Waist', desc: 'Measure around your natural waistline', color: 'purple' },
    { name: 'Length', desc: 'From shoulder to hem', color: 'green' },
    { name: 'Across Shoulder', desc: 'From one shoulder seam to the other', color: 'red' },
    { name: 'Sleeve Length', desc: 'From shoulder seam to wrist', color: 'orange' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* ============ HEADER ============ */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-pink-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Size Chart - {clothingType || 'T-Shirt'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {productName || 'Product'} • Size {variant?.size || 'M'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Unit Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setUnit('inches')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  unit === 'inches' 
                    ? 'bg-white dark:bg-gray-700 text-pink-500 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                IN
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  unit === 'cm' 
                    ? 'bg-white dark:bg-gray-700 text-pink-500 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                CM
              </button>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* ============ MAIN CONTENT ============ */}
        <div className="p-6">
          
          {/* Title Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Size Chart
            </h1>
            <h2 className="text-lg text-gray-600 dark:text-gray-400 mt-1">
              Size Chart | How to measure
            </h2>
          </div>

          {/* ============ TWO COLUMN LAYOUT ============ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Left Column - T-Shirt Diagram */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Measurement Guide
              </h3>
              <TShirtDiagram />
              
              {/* Color Legend */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Shoulder</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Chest</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Waist</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  <span>Hips</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Length</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Sleeve</span>
                </div>
              </div>
            </div>

            {/* Right Column - Size Chart Table */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Size Chart
              </h3>
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      {headers.map((header) => (
                        <th 
                          key={header.key}
                          className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"
                        >
                          {header.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(sizeChartData).map(([size, measurements], index) => (
                      <tr 
                        key={size}
                        className={`${
                          index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'
                        } hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors ${
                          variant?.size === size ? 'bg-pink-50 dark:bg-pink-900/20' : ''
                        }`}
                      >
                        <td className="px-3 py-2 text-xs font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                          {size}
                          {variant?.size === size && (
                            <span className="ml-1 text-pink-500">✓</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                          {measurements.chest}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                          {measurements.length}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                          {measurements.shoulder}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                          {measurements.sleeve}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                          {measurements.hips}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="my-6 border-gray-200 dark:border-gray-700" />

          {/* ============ HOW TO MEASURE SECTION ============ */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              How to measure
            </h3>
            
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="flex items-center justify-between w-full text-left mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <span className="text-base font-medium text-gray-900 dark:text-white">
                Measurement Guide
              </span>
              {showGuide ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {showGuide && (
              <div className="space-y-4">
                {/* Measurement points list */}
                <div className="grid grid-cols-2 gap-4">
                  {measurementTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className={`w-2 h-2 mt-1.5 rounded-full bg-${tip.color}-500`}></div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {tip.name}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {tip.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============ CLOSE BUTTON ============ */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
          <button
            onClick={onClose}
            className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SizeChartModal;