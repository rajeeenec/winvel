import { THEME_PRESETS } from '../config/themePresets';
import './ThemePresetPicker.css';

export default function ThemePresetPicker({ activePresetId, onSelect, applying }) {
  return (
    <div className="theme-presets">
      <h3 className="theme-presets-title">Quick theme presets</h3>
      <p className="theme-presets-hint">
        Pick a ready-made color combination — all theme colors update together. No need to pick each color manually.
      </p>
      <div className="theme-presets-grid">
        {THEME_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`theme-preset-card ${activePresetId === preset.id ? 'active' : ''}`}
            onClick={() => onSelect(preset)}
            disabled={applying}
          >
            <div className="theme-preset-swatches">
              {preset.swatch.map((color) => (
                <span key={color} className="theme-preset-swatch" style={{ background: color }} />
              ))}
            </div>
            <span className="theme-preset-name">{preset.name}</span>
            <span className="theme-preset-desc">{preset.description}</span>
            {activePresetId === preset.id && (
              <span className="theme-preset-badge">Active</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
