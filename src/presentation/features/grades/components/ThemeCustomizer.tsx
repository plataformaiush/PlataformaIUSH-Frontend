// src/presentation/features/grades/components/ThemeCustomizer.tsx

import { useState } from 'react';
import { Palette } from 'lucide-react';
import type { ThemeColors } from '../../../../domain/grades';

const DEFAULT_COLORS: ThemeColors = {
  primary:   '#223740',
  secondary: '#5A878C',
  tertiary:  '#AEEBF2',
  neutral:   '#060A0D',
};

export function ThemeCustomizer() {
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_COLORS);
  const [isOpen, setIsOpen] = useState(false);

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
    document.documentElement.style.setProperty(`--${key}`, value);
  };

  const resetColors = () => {
    setColors(DEFAULT_COLORS);
    (Object.entries(DEFAULT_COLORS) as [keyof ThemeColors, string][]).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="bg-primary text-primary-foreground w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        aria-label="Personalizar tema"
      >
        <Palette className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-card border border-border rounded-lg shadow-xl p-6">
          <h3 className="text-foreground mb-4">Personalización de Tema</h3>
          <p className="text-muted-foreground mb-4">Personaliza los colores de tu marca</p>

          <div className="space-y-4">
            {(Object.entries(colors) as [keyof ThemeColors, string][]).map(([key, value]) => (
              <div key={key}>
                <label className="text-foreground mb-2 block capitalize">{key}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="w-12 h-10 rounded border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="flex-1 px-3 py-2 bg-input-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="#000000"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={resetColors}
            className="w-full mt-4 px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/80 transition-colors"
          >
            Restablecer por Defecto
          </button>
        </div>
      )}
    </div>
  );
}
