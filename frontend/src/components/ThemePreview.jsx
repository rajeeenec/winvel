import { THEME_CSS_MAP } from '../config/themeMap';
import './ThemePreview.css';

export default function ThemePreview({ formValues }) {
  const previewStyle = {};
  for (const [flatKey, cssVar] of Object.entries(THEME_CSS_MAP)) {
    const value = formValues[flatKey];
    if (value) previewStyle[cssVar] = value;
  }

  return (
    <div className="theme-preview-panel card">
      <h3 className="theme-preview-title">Live preview — where colors apply</h3>
      <div className="theme-preview-mock" style={previewStyle}>
        <div className="preview-sidebar">
          <span className="preview-sidebar-label">Sidebar / Footer</span>
          <span className="preview-sidebar-item active">Nav link</span>
        </div>
        <div className="preview-main">
          <div className="preview-header-bar">
            <span>Header bar</span>
          </div>
          <div className="preview-content">
            <div className="preview-card-mock">
              <p className="preview-text-main">Main text on cards</p>
              <p className="preview-text-muted">Muted secondary text</p>
            </div>
            <div className="preview-actions">
              <button type="button" className="preview-btn-primary">Primary button</button>
              <button type="button" className="preview-btn-outline">Outline</button>
            </div>
            <div className="preview-badges">
              <span className="preview-badge success">Delivered</span>
              <span className="preview-badge warning">Pending</span>
              <span className="preview-badge danger">Cancelled</span>
              <span className="preview-badge info">Processing</span>
            </div>
          </div>
        </div>
      </div>
      <ul className="theme-preview-legend">
        <li><strong>Primary</strong> — admin sidebar, footer, dark areas</li>
        <li><strong>Secondary</strong> — Shop Now, Sign Up, active links</li>
        <li><strong>Surface / BG</strong> — page background, cards, header</li>
        <li><strong>Status badges</strong> — order status, alerts</li>
      </ul>
    </div>
  );
}
