import { createContext, useContext, useState, useEffect } from 'react';
import settingsService from '../services/settingsService';

const ConfigContext = createContext({});

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await settingsService.getPublicConfig();
        setConfig(data);
      } catch {
        console.warn('Could not load public config');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  return useContext(ConfigContext);
}

export default ConfigContext;
