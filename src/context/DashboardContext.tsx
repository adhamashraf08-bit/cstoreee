import React, { createContext, useContext, useState, useEffect } from 'react';
import { SalesReport, BranchData, WebsiteData } from '../../types';
import { DASHBOARD_DATA } from '../../constants';

interface DashboardContextType {
    data: SalesReport;
    updateBranch: (index: number, branch: BranchData) => void;
    updateWebsite: (website: WebsiteData) => void;
    updateAllData: (newData: SalesReport) => void;
    resetData: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<SalesReport>(() => {
        try {
            const saved = localStorage.getItem('dashboard_data');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Basic validation check
                if (parsed && Array.isArray(parsed.branches) && parsed.branches.length > 0 && parsed.website) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error("Failed to parse dashboard data", e);
        }
        return DASHBOARD_DATA;
    });

    useEffect(() => {
        localStorage.setItem('dashboard_data', JSON.stringify(data));
    }, [data]);

    const updateBranch = (index: number, branch: BranchData) => {
        setData(prev => {
            const newBranches = [...prev.branches];
            newBranches[index] = branch;
            return { ...prev, branches: newBranches };
        });
    };

    const updateWebsite = (website: WebsiteData) => {
        setData(prev => ({ ...prev, website }));
    };

    const updateAllData = (newData: SalesReport) => {
        setData(newData);
    };

    const resetData = () => {
        setData(DASHBOARD_DATA);
        localStorage.removeItem('dashboard_data');
    };

    return (
        <DashboardContext.Provider value={{ data, updateBranch, updateWebsite, updateAllData, resetData }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
