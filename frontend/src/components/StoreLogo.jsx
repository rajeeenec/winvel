import { useSettings } from '../context/SettingsContext';

export default function StoreLogo({ className = '' }) {
  const { appName, logoUrl } = useSettings();

  if (logoUrl) {
    return (
      <img src={logoUrl} alt={appName} className={`store-logo-img ${className}`} />
    );
  }

  return (
    <span className={`logo-icon ${className}`}>
      {appName.charAt(0).toUpperCase()}
    </span>
  );
}
