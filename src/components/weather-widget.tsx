"use client";

import { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, Thermometer } from 'lucide-react';

export function WeatherWidget() {
  const [weather, setWeather] = useState<{ temp: number; icon: string } | null>(null);

  useEffect(() => {
    // Mocking weather for Cointrin (Geneva)
    setWeather({ temp: 18, icon: 'sun' });
  }, []);

  if (!weather) return null;

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm border">
      <div className="p-2 bg-secondary/10 rounded-xl">
        {weather.icon === 'sun' ? <Sun className="h-6 w-6 text-secondary" /> : <Cloud className="h-6 w-6 text-primary" />}
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Cointrin, Geneva</p>
        <p className="text-lg font-bold flex items-center gap-1">
          {weather.temp}°C <Thermometer className="h-4 w-4 text-muted-foreground" />
        </p>
      </div>
    </div>
  );
}