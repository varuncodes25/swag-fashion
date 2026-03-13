import React, { useState } from 'react';
import { Ruler, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const SizeChartForm = ({ color, size, sizeData, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Measurement fields
  const measurementFields = [
    { name: 'chest', label: 'Chest', unit: 'inches' },
    { name: 'waist', label: 'Waist', unit: 'inches' },
    { name: 'hips', label: 'Hips', unit: 'inches' },
    { name: 'length', label: 'Length', unit: 'inches' },
    { name: 'shoulder', label: 'Shoulder', unit: 'inches' },
    { name: 'sleeve', label: 'Sleeve', unit: 'inches' },
    { name: 'modelHeight', label: 'Model Height', unit: 'cm' },
    { name: 'modelWeight', label: 'Model Weight', unit: 'kg' },
  ];
  
  const handleChange = (field, value) => {
    onUpdate(color, size, field, value);
  };
  
  return (
    <div className="border border-border rounded-lg mt-2 bg-card">
      {/* Header - Click to expand */}
      <div 
        className="flex items-center justify-between p-3 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors rounded-t-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Ruler className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm text-foreground">Size {size}</span>
          {sizeData && Object.keys(sizeData).length > 2 && (
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
              ✓ Measurements Added
            </span>
          )}
        </div>
        {isOpen ? 
          <ChevronUp className="h-4 w-4 text-muted-foreground" /> : 
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        }
      </div>
      
      {/* Content - Shows when expanded */}
      {isOpen && (
        <div className="p-4 space-y-4 border-t border-border">
          {/* Measurements Grid */}
          <div className="grid grid-cols-2 gap-4">
            {measurementFields.map((field) => (
              <div key={field.name}>
                <Label className="text-xs text-muted-foreground">
                  {field.label} ({field.unit})
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder={`Enter ${field.label}`}
                  value={sizeData?.[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value ? parseFloat(e.target.value) : '')}
                  className="mt-1 bg-background border-input text-foreground placeholder:text-muted-foreground"
                />
              </div>
            ))}
          </div>
          
          {/* Fit Description */}
          <div>
            <Label className="text-xs text-muted-foreground">Fit Description</Label>
            <Select
              value={sizeData?.fitDescription || ''}
              onValueChange={(value) => handleChange('fitDescription', value)}
            >
              <SelectTrigger className="bg-background border-input text-foreground">
                <SelectValue placeholder="Select fit type" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="True to size" className="text-foreground hover:bg-accent">True to size</SelectItem>
                <SelectItem value="Runs small - size up" className="text-foreground hover:bg-accent">Runs small - size up</SelectItem>
                <SelectItem value="Runs large - size down" className="text-foreground hover:bg-accent">Runs large - size down</SelectItem>
                <SelectItem value="Relaxed fit" className="text-foreground hover:bg-accent">Relaxed fit</SelectItem>
                <SelectItem value="Slim fit" className="text-foreground hover:bg-accent">Slim fit</SelectItem>
                <SelectItem value="Oversized" className="text-foreground hover:bg-accent">Oversized</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Model Wearing */}
          <div>
            <Label className="text-xs text-muted-foreground">Model Wearing</Label>
            <Input
              value={sizeData?.modelWearing || ''}
              onChange={(e) => handleChange('modelWearing', e.target.value)}
              placeholder="e.g., Model is 6' tall, wearing M"
              className="mt-1 bg-background border-input text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SizeChartForm;