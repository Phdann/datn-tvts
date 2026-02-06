import { createContext, useContext, useState, useEffect } from 'react';
import settingsService from '../services/settingsService';

const ConfigContext = createContext();

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error('useConfig must be used within ConfigProvider');
    }
    return context;
};

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const data = await settingsService.getPublicConfig();
            setConfig(data);
        } catch (error) {
            console.error('Error loading config:', error);
            setConfig({
                maintenance_mode: false,
                gemini_enabled: true,
                admission_open: true
            });
        } finally {
            setLoading(false);
        }
    };

    const refreshConfig = async () => {
        await loadConfig();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Đang tải cấu hình...</p>
                </div>
            </div>
        );
    }

    return (
        <ConfigContext.Provider value={{ config, refreshConfig }}>
            {children}
        </ConfigContext.Provider>
    );
};
