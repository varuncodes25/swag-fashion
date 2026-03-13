// components/Product/SizeChartModal.jsx
import React, { useState } from 'react';
import { X, Ruler, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const SizeChartModal = ({ isOpen, onClose, variant, productName, clothingType }) => {
  const [unit, setUnit] = useState('inches');
  const [showGuide, setShowGuide] = useState(true);
  
  if (!isOpen || !variant?.sizeDetails) return null;

  // ============ CLOTHING TYPE CATEGORIES ============
  const categories = {
    topWear: ['T-Shirt', 'Shirt', 'Jacket', 'Sweater', 'Hoodie', 'Sweatshirt', 'Top', 'Kurta', 'Blouse', 'Sherwani'],
    bottomWear: ['Jeans', 'Trousers', 'Shorts', 'Skirt', 'Track Suit', 'Leggings', 'Capris', 'Pyjama'],
    fullBody: ['Dress', 'Saree', 'Lehenga', 'Gown', 'Jumpsuit', 'Bodysuit'],
    innerWear: ['Innerwear', 'Bra', 'Panties', 'Boxers', 'Briefs']
  };

  // ============ DYNAMIC HEADERS BASED ON CLOTHING TYPE ============
  const getHeaders = () => {
    // Top Wear ke liye
    if (categories.topWear.includes(clothingType)) {
      return [
        { key: 'size', label: 'Size' },
        { key: 'chest', label: `Chest (${unit})` },
        { key: 'shoulder', label: `Across Shoulder (${unit})` },
        { key: 'sleeve', label: `Sleeve Length (${unit})` },
        { key: 'length', label: `Front Length (${unit})` }
      ];
    }
    
    // Bottom Wear ke liye
    if (categories.bottomWear.includes(clothingType)) {
      return [
        { key: 'size', label: 'Size' },
        { key: 'waist', label: `Waist (${unit})` },
        { key: 'hips', label: `Hips (${unit})` },
        { key: 'inseam', label: `Inseam (${unit})` },
        { key: 'length', label: `Length (${unit})` }
      ];
    }
    
    // Full Body ke liye
    if (categories.fullBody.includes(clothingType)) {
      return [
        { key: 'size', label: 'Size' },
        { key: 'chest', label: `Chest (${unit})` },
        { key: 'waist', label: `Waist (${unit})` },
        { key: 'hips', label: `Hips (${unit})` },
        { key: 'length', label: `Length (${unit})` }
      ];
    }
    
    // Default
    return [
      { key: 'size', label: 'Size' },
      { key: 'chest', label: `Chest (${unit})` },
      { key: 'length', label: `Length (${unit})` }
    ];
  };

  // ============ DYNAMIC SAMPLE DATA ============
  const getSampleData = () => {
    const baseData = {
      "S": {},
      "M": {},
      "L": {},
      "XL": {}
    };

    if (categories.topWear.includes(clothingType)) {
      return {
        "S": { chest: 38, shoulder: 18, sleeve: 22, length: 25 },
        "M": { chest: 40, shoulder: 19, sleeve: 22.5, length: 26 },
        "L": { chest: 42, shoulder: 18, sleeve: 23, length: 27 },
        "XL": { chest: 44, shoulder: 19, sleeve: 23.5, length: 28 }
      };
    }
    
    if (categories.bottomWear.includes(clothingType)) {
      return {
        "S": { waist: 30, hips: 38, inseam: 28, length: 38 },
        "M": { waist: 32, hips: 40, inseam: 30, length: 40 },
        "L": { waist: 34, hips: 42, inseam: 32, length: 42 },
        "XL": { waist: 36, hips: 44, inseam: 34, length: 44 }
      };
    }
    
    if (categories.fullBody.includes(clothingType)) {
      return {
        "S": { chest: 34, waist: 28, hips: 36, length: 52 },
        "M": { chest: 36, waist: 30, hips: 38, length: 54 },
        "L": { chest: 38, waist: 32, hips: 40, length: 56 },
        "XL": { chest: 40, waist: 34, hips: 42, length: 58 }
      };
    }
    
    return baseData;
  };

  const headers = getHeaders();
  const sizeChartData = getSampleData();

  // ============ DYNAMIC DIAGRAM BASED ON CLOTHING TYPE ============
  const DynamicDiagram = () => {
    // Top Wear Diagram
    if (categories.topWear.includes(clothingType)) {
      return (
        <div className="relative w-full h-64 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
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

            {/* Shoulder Line */}
            <line 
              x1="100" y1="50" 
              x2="200" y2="50" 
              stroke="#ef4444" 
              strokeWidth="2" 
              strokeDasharray="5,5"
            />
            <text x="150" y="40" fontSize="12" fill="#ef4444" textAnchor="middle">Shoulder</text>

            {/* Chest Line */}
            <line 
              x1="80" y1="100" 
              x2="220" y2="100" 
              stroke="#3b82f6" 
              strokeWidth="2" 
              strokeDasharray="5,5"
            />
            <text x="150" y="90" fontSize="12" fill="#3b82f6" textAnchor="middle">Chest</text>

            {/* Length Line */}
            <line 
              x1="230" y1="50" 
              x2="230" y2="220" 
              stroke="#22c55e" 
              strokeWidth="2" 
              strokeDasharray="5,5"
            />
            <text x="245" y="135" fontSize="12" fill="#22c55e" transform="rotate(90, 245, 135)">Length</text>

            {/* Sleeve Line */}
            <line 
              x1="220" y1="90" 
              x2="250" y2="120" 
              stroke="#f97316" 
              strokeWidth="2" 
              strokeDasharray="5,5"
            />
            <text x="260" y="100" fontSize="12" fill="#f97316">Sleeve</text>
          </svg>
        </div>
      );
    }

    // Bottom Wear Diagram
    if (categories.bottomWear.includes(clothingType)) {
      return (
        <div className="relative w-full h-64 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
          <svg viewBox="0 0 300 300" className="w-full h-full">
            {/* Pants Outline */}
            <path 
              d="M100 50 L200 50 L200 200 L150 250 L100 200 L100 50" 
              fill="none" 
              stroke="#333" 
              strokeWidth="2"
              className="dark:stroke-gray-400"
            />
            
            {/* Waist Line */}
            <line 
              x1="100" y1="50" 
              x2="200" y2="50" 
              stroke="#8b5cf6" 
              strokeWidth="2" 
              strokeDasharray="5,5"
            />
            <text x="150" y="40" fontSize="12" fill="#8b5cf6" textAnchor="middle">Waist</text>

            {/* Hips Line */}
            <line 
              x1="95" y1="100" 
              x2="205" y2="100" 
              stroke="#ec4899" 
              strokeWidth="2" 
              strokeDasharray="5,5"
            />
            <text x="150" y="90" fontSize="12" fill="#ec4899" textAnchor="middle">Hips</text>

            {/* Inseam Line */}
            <line 
              x1="150" y1="100" 
              x2="150" y2="230" 
              stroke="#f97316" 
              strokeWidth="2" 
              strokeDasharray="5,5"
            />
            <text x="165" y="165" fontSize="12" fill="#f97316" transform="rotate(90, 165, 165)">Inseam</text>

            {/* Length Line */}
            <line 
              x1="220" y1="50" 
              x2="220" y2="230" 
              stroke="#22c55e" 
              strokeWidth="2" 
              strokeDasharray="5,5"
            />
            <text x="235" y="140" fontSize="12" fill="#22c55e" transform="rotate(90, 235, 140)">Length</text>
          </svg>
        </div>
      );
    }

    // Full Body Diagram
    if (categories.fullBody.includes(clothingType)) {
      return (
        <div className="relative w-full h-64 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
          <svg viewBox="0 0 300 300" className="w-full h-full">
            {/* Dress Outline */}
            <path 
              d="M120 50 L180 50 L200 100 L200 200 L150 250 L100 200 L100 100 L120 50" 
              fill="none" 
              stroke="#333" 
              strokeWidth="2"
              className="dark:stroke-gray-400"
            />
            
            {/* Chest Line */}
            <line 
              x1="100" y1="100" 
              x2="200" y2="100" 
              stroke="#3b82f6" 
              strokeWidth="2" 
              strokeDasharray="5,5"
            />
            <text x="150" y="90" fontSize="12" fill="#3b82f6" textAnchor="middle">Chest</text>

            {/* Waist Line */}
            <line 
              x1="105" y1="150" 
              x2="195" y2="150" 
              stroke="#8b5cf6" 
              strokeWidth="2" 
              strokeDasharray="5,5"
            />
            <text x="150" y="140" fontSize="12" fill="#8b5cf6" textAnchor="middle">Waist</text>

            {/* Hips Line */}
            <line 
              x1="110" y1="190" 
              x2="190" y2="190" 
              stroke="#ec4899" 
              strokeWidth="2" 
              strokeDasharray="5,5"
            />
            <text x="150" y="180" fontSize="12" fill="#ec4899" textAnchor="middle">Hips</text>

            {/* Length Line */}
            <line 
              x1="220" y1="50" 
              x2="220" y2="230" 
              stroke="#22c55e" 
              strokeWidth="2" 
              strokeDasharray="5,5"
            />
            <text x="235" y="140" fontSize="12" fill="#22c55e" transform="rotate(90, 235, 140)">Length</text>
          </svg>
        </div>
      );
    }

    return <div className="w-full h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">No diagram available</div>;
  };

  // ============ DYNAMIC MEASUREMENT TIPS ============
  const getMeasurementTips = () => {
    if (categories.topWear.includes(clothingType)) {
      return [
        { name: 'Chest', desc: 'Measure around the fullest part of your chest', color: 'blue' },
        { name: 'Shoulder', desc: 'From one shoulder seam to the other', color: 'red' },
        { name: 'Sleeve', desc: 'From shoulder seam to wrist', color: 'orange' },
        { name: 'Length', desc: 'From shoulder to bottom hem', color: 'green' }
      ];
    }
    
    if (categories.bottomWear.includes(clothingType)) {
      return [
        { name: 'Waist', desc: 'Measure around your natural waistline', color: 'purple' },
        { name: 'Hips', desc: 'Measure around the fullest part of your hips', color: 'pink' },
        { name: 'Inseam', desc: 'From crotch to bottom of leg', color: 'orange' },
        { name: 'Length', desc: 'From waist to bottom hem', color: 'green' }
      ];
    }
    
    if (categories.fullBody.includes(clothingType)) {
      return [
        { name: 'Chest', desc: 'Measure around the fullest part of your chest', color: 'blue' },
        { name: 'Waist', desc: 'Measure around your natural waistline', color: 'purple' },
        { name: 'Hips', desc: 'Measure around the fullest part of your hips', color: 'pink' },
        { name: 'Length', desc: 'From shoulder to bottom hem', color: 'green' }
      ];
    }
    
    return [];
  };

  const headersList = getHeaders();
  const measurementTips = getMeasurementTips();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-pink-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Size Chart - {clothingType}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {productName} • Size {variant?.size}
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
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Size Chart</h1>
            <h2 className="text-lg text-gray-600 dark:text-gray-400 mt-1">Size Chart | How to measure</h2>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Left Column - Dynamic Diagram */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Measurement Guide - {clothingType}
              </h3>
              <DynamicDiagram />
              
              {/* Color Legend */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {measurementTips.map((tip, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded-full bg-${tip.color}-500`}></div>
                    <span>{tip.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Dynamic Table */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Size Chart - {clothingType}
              </h3>
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      {headersList.map((header) => (
                        <th key={header.key} className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b">
                          {header.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(sizeChartData).map(([size, measurements], index) => (
                      <tr key={size} className={`${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'
                      } hover:bg-pink-50 dark:hover:bg-pink-900/20 ${
                        variant?.size === size ? 'bg-pink-50 dark:bg-pink-900/20' : ''
                      }`}>
                        {headersList.map((header) => {
                          if (header.key === 'size') {
                            return (
                              <td key={header.key} className="px-3 py-2 text-xs font-medium border-b">
                                {size}
                                {variant?.size === size && <span className="ml-1 text-pink-500">✓</span>}
                              </td>
                            );
                          }
                          const value = measurements[header.key];
                          return (
                            <td key={header.key} className="px-3 py-2 text-xs border-b">
                              {value || '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="my-6 border-gray-200 dark:border-gray-700" />

          {/* How to Measure */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">How to measure</h3>
            
            <button onClick={() => setShowGuide(!showGuide)} className="flex items-center justify-between w-full text-left mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-base font-medium">Measurement Guide</span>
              {showGuide ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {showGuide && (
              <div className="grid grid-cols-2 gap-4">
                {measurementTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className={`w-2 h-2 mt-1.5 rounded-full bg-${tip.color}-500`}></div>
                    <div>
                      <span className="font-medium text-sm">{tip.name}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t p-4">
          <button onClick={onClose} className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SizeChartModal;