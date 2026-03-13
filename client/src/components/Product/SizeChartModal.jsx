// components/Product/SizeChartModal.jsx
import React, { useState } from 'react';
import { X, Ruler, HelpCircle, ChevronDown, ChevronUp, User } from 'lucide-react';

const SizeChartModal = ({ isOpen, onClose, variant, productName, clothingType }) => {
  const [unit, setUnit] = useState('inches');
  const [showGuide, setShowGuide] = useState(true);
  
  if (!isOpen || !variant?.sizeDetails) return null;

  const sizeDetails = variant.sizeDetails;

  // Measurement labels mapping
  const measurementLabels = {
    chest: 'Chest',
    waist: 'Waist',
    hips: 'Hips',
    length: 'Length',
    shoulder: 'Shoulder',
    sleeve: 'Sleeve',
    inseam: 'Inseam'
  };

  // ============ CLOTHING TYPE CATEGORIES ============
  const categories = {
    topWear: ['T-Shirt', 'Shirt', 'Jacket', 'Sweater', 'Hoodie', 'Sweatshirt', 'Top', 'Kurta', 'Blouse', 'Sherwani'],
    bottomWear: ['Jeans', 'Trousers', 'Shorts', 'Skirt', 'Track Suit', 'Leggings', 'Capris'],
    fullBody: ['Dress', 'Saree', 'Lehenga', 'Gown', 'Jumpsuit', 'Bodysuit'],
    innerWear: ['Innerwear', 'Bra', 'Panties', 'Boxers', 'Briefs'],
    accessories: ['Socks', 'Cap', 'Scarf', 'Gloves', 'Hat']
  };

  // ============ GET RELEVANT MEASUREMENTS ============
  const getRelevantMeasurements = () => {
    const topWearMeas = ['chest', 'shoulder', 'sleeve', 'length'];
    const bottomWearMeas = ['waist', 'hips', 'inseam', 'length'];
    const fullBodyMeas = ['chest', 'waist', 'hips', 'length', 'shoulder', 'sleeve'];
    const innerWearMeas = ['chest', 'waist', 'hips'];
    const accessoriesMeas = []; // No measurements for accessories

    if (categories.topWear.includes(clothingType)) {
      return topWearMeas;
    } else if (categories.bottomWear.includes(clothingType)) {
      return bottomWearMeas;
    } else if (categories.fullBody.includes(clothingType)) {
      return fullBodyMeas;
    } else if (categories.innerWear.includes(clothingType)) {
      return innerWearMeas;
    } else if (categories.accessories.includes(clothingType)) {
      return accessoriesMeas;
    }
    
    // Default - all measurements
    return Object.keys(measurementLabels);
  };

  // ============ GET DIAGRAM TYPE ============
  const getDiagramType = () => {
    if (categories.topWear.includes(clothingType)) return 'top';
    if (categories.bottomWear.includes(clothingType)) return 'bottom';
    if (categories.fullBody.includes(clothingType)) return 'full';
    if (categories.innerWear.includes(clothingType)) return 'inner';
    return 'default';
  };

  const measurements = getRelevantMeasurements();
  const hasMeasurements = measurements.some(m => sizeDetails[m]);
  const diagramType = getDiagramType();

  // Convert between inches and cm
  const convertValue = (value, fromUnit, toUnit) => {
    if (!value) return '-';
    if (fromUnit === toUnit) return value;
    return toUnit === 'cm' ? (value * 2.54).toFixed(1) : (value / 2.54).toFixed(1);
  };

  // Get icon for measurement
  const getMeasurementIcon = (key) => {
    switch(key) {
      case 'chest': return '👕';
      case 'waist': return '👖';
      case 'hips': return '📐';
      case 'length': return '📏';
      case 'shoulder': return '🦴';
      case 'sleeve': return '💪';
      case 'inseam': return '👞';
      default: return '📏';
    }
  };

  // ============ RENDER DIAGRAM BASED ON TYPE ============
  const renderDiagram = () => {
    const diagramConfig = {
      top: {
        lines: [
          { type: 'shoulder', top: '25%', left: '20%', width: '60%', color: 'red', label: 'Shoulder' },
          { type: 'chest', top: '40%', left: '15%', width: '70%', color: 'blue', label: 'Chest' },
          { type: 'length', vertical: true, top: '20%', left: '75%', height: '60%', color: 'green', label: 'Length' },
          { type: 'sleeve', top: '30%', left: '75%', width: '20%', rotate: true, color: 'orange', label: 'Sleeve' }
        ]
      },
      bottom: {
        lines: [
          { type: 'waist', top: '40%', left: '20%', width: '60%', color: 'purple', label: 'Waist' },
          { type: 'hips', top: '60%', left: '15%', width: '70%', color: 'pink', label: 'Hips' },
          { type: 'inseam', vertical: true, top: '40%', left: '50%', height: '40%', color: 'brown', label: 'Inseam' },
          { type: 'length', vertical: true, top: '20%', left: '75%', height: '70%', color: 'green', label: 'Length' }
        ]
      },
      full: {
        lines: [
          { type: 'shoulder', top: '20%', left: '20%', width: '60%', color: 'red', label: 'Shoulder' },
          { type: 'chest', top: '35%', left: '15%', width: '70%', color: 'blue', label: 'Chest' },
          { type: 'waist', top: '50%', left: '20%', width: '60%', color: 'purple', label: 'Waist' },
          { type: 'hips', top: '65%', left: '15%', width: '70%', color: 'pink', label: 'Hips' },
          { type: 'length', vertical: true, top: '15%', left: '75%', height: '70%', color: 'green', label: 'Length' }
        ]
      },
      inner: {
        lines: [
          { type: 'chest', top: '35%', left: '20%', width: '60%', color: 'blue', label: 'Chest' },
          { type: 'waist', top: '55%', left: '20%', width: '60%', color: 'purple', label: 'Waist' },
          { type: 'hips', top: '75%', left: '20%', width: '60%', color: 'pink', label: 'Hips' }
        ]
      }
    };

    const config = diagramConfig[diagramType] || diagramConfig.top;

    return (
      <div className="relative w-full h-full">
        {/* Human silhouette */}
        <div className="absolute inset-0 flex items-center justify-center">
          <User className="w-32 h-32 text-gray-400 dark:text-gray-600" />
        </div>
        
        {/* Measurement lines */}
        {config.lines.map((line, index) => {
          if (!measurements.includes(line.type)) return null;
          
          if (line.vertical) {
            return (
              <React.Fragment key={index}>
                <div 
                  className="absolute w-0.5 bg-opacity-60"
                  style={{
                    top: line.top,
                    left: line.left,
                    height: line.height,
                    backgroundColor: `${line.color}400`,
                    transform: 'translateX(-50%)'
                  }}
                />
                <span 
                  className="absolute text-xs font-medium px-2 py-0.5 rounded-full shadow-sm bg-white dark:bg-gray-800"
                  style={{
                    top: `calc(${line.top} + ${line.height} / 2)`,
                    left: `calc(${line.left} + 5%)`,
                    color: `${line.color}500`,
                    transform: 'translateY(-50%)'
                  }}
                >
                  {line.label}
                </span>
              </React.Fragment>
            );
          } else {
            return (
              <React.Fragment key={index}>
                <div 
                  className="absolute h-0.5 bg-opacity-60"
                  style={{
                    top: line.top,
                    left: line.left,
                    width: line.width,
                    backgroundColor: `${line.color}400`,
                    transform: line.rotate ? 'rotate(45deg)' : 'none'
                  }}
                />
                <span 
                  className="absolute text-xs font-medium px-2 py-0.5 rounded-full shadow-sm bg-white dark:bg-gray-800"
                  style={{
                    top: `calc(${line.top} - 5%)`,
                    left: '50%',
                    color: `${line.color}500`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {line.label}
                </span>
              </React.Fragment>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-pink-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Size Chart - {clothingType}
            </h2>
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
                Inches
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

        <div className="p-6">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column - Diagram */}
            <div className="bg-gradient-to-br from-pink-50 to-blue-50 dark:from-pink-900/20 dark:to-blue-900/20 rounded-lg p-6">
              <div className="aspect-square relative">
                {renderDiagram()}
              </div>
              
              {/* Size Info */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Selected Size: <span className="text-lg font-bold text-pink-500">{variant.size}</span>
                </p>
                {sizeDetails.fitDescription && (
                  <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${
                    sizeDetails.fitDescription.includes('small') ? 'bg-orange-100 text-orange-700' :
                    sizeDetails.fitDescription.includes('large') ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    👕 {sizeDetails.fitDescription}
                  </span>
                )}
              </div>
            </div>

            {/* Right Column - Measurements Table */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Body Measurements
              </h3>
              
              {hasMeasurements ? (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
                  {measurements.map((key) => {
                    if (!sizeDetails[key]) return null;
                    const displayValue = convertValue(
                      sizeDetails[key], 
                      sizeDetails.unit || 'inches', 
                      unit
                    );
                    
                    return (
                      <div key={key} className="flex justify-between items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <span className="text-lg">{getMeasurementIcon(key)}</span>
                          {measurementLabels[key] || key}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {displayValue} {unit}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No measurements available</p>
                </div>
              )}

              {/* Model Stats */}
              {(sizeDetails.modelHeight || sizeDetails.modelWeight) && (
                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2 uppercase tracking-wider">
                    Model Stats
                  </h4>
                  <div className="space-y-2">
                    {sizeDetails.modelHeight && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-blue-600">📏</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          Height: {sizeDetails.modelHeight} cm
                        </span>
                      </div>
                    )}
                    {sizeDetails.modelWeight && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-blue-600">⚖️</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          Weight: {sizeDetails.modelWeight} kg
                        </span>
                      </div>
                    )}
                    {sizeDetails.modelWearing && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-blue-600">👕</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {sizeDetails.modelWearing}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* How to Measure */}
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  How to Measure
                </span>
              </div>
              {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showGuide && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                {measurements.map((key) => {
                  const tips = {
                    chest: 'Measure around the fullest part of your chest, keeping the tape parallel to the ground',
                    waist: 'Measure around your natural waistline, just above your belly button',
                    hips: 'Measure around the fullest part of your hips and buttocks',
                    length: 'From the highest point of shoulder to the bottom hem',
                    shoulder: 'From one shoulder seam to the other, across the back',
                    sleeve: 'From shoulder seam to the end of sleeve, with arm slightly bent',
                    inseam: 'From crotch seam to the bottom of the leg, along the inner seam'
                  };
                  
                  return (
                    <div key={key} className="flex gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-lg">{getMeasurementIcon(key)}</span>
                      <div>
                        <p className="text-xs font-medium text-gray-900 dark:text-white capitalize mb-1">
                          {measurementLabels[key]}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {tips[key] || `Measure your ${key}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
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