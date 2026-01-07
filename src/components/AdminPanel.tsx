import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { BranchData, WebsiteData } from '../../types';
import { parsePDFToDashboardData } from '../utils/PDFParser';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export const AdminPanel: React.FC = () => {
    const { data, updateBranch, updateWebsite, updateAllData, resetData } = useDashboard();
    const [activeTab, setActiveTab] = useState<'branches' | 'website'>('branches');
    const [selectedBranchIdx, setSelectedBranchIdx] = useState(0);
    const [websiteForm, setWebsiteForm] = useState<WebsiteData>(data.website);
    const [branchForm, setBranchForm] = useState<BranchData | null>(data.branches[0] || null);

    // PDF upload state
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [uploadMessage, setUploadMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setWebsiteForm(data.website);
    }, [data.website]);

    useEffect(() => {
        if (data.branches && data.branches[selectedBranchIdx]) {
            setBranchForm(data.branches[selectedBranchIdx]);
        } else {
            setBranchForm(null);
        }
    }, [data.branches, selectedBranchIdx]);

    const handleWebsiteChange = (field: keyof WebsiteData, value: number) => {
        setWebsiteForm(prev => ({ ...prev, [field]: value }));
    };

    const handleBranchChannelChange = (channelIdx: number, field: string, value: number | string) => {
        if (!branchForm) return;
        setBranchForm(prev => {
            if (!prev) return null;
            const newChannels = [...prev.channels];
            newChannels[channelIdx] = { ...newChannels[channelIdx], [field]: value };

            const totalSales = newChannels.reduce((sum, ch) => sum + ch.sales, 0);
            const totalOrders = newChannels.reduce((sum, ch) => sum + ch.orders, 0);
            const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

            return {
                ...prev,
                channels: newChannels,
                totalSales,
                totalOrders,
                avgOrderValue
            };
        });
    };

    const saveBranch = () => {
        if (!branchForm) return;
        updateBranch(selectedBranchIdx, branchForm);
        alert('Branch saved!');
    };

    const saveWebsite = () => {
        const newWebsite = { ...websiteForm };
        if (newWebsite.visits > 0) {
            newWebsite.conversionRate = (newWebsite.totalOrders / newWebsite.visits) * 100;
        }
        newWebsite.avgOrderValue = newWebsite.totalOrders > 0 ? newWebsite.totalSales / newWebsite.totalOrders : 0;

        updateWebsite(newWebsite);
        alert('Website stats saved!');
    };

    const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (file.type !== 'application/pdf') {
            setUploadStatus('error');
            setUploadMessage('Please upload a PDF file');
            setTimeout(() => setUploadStatus('idle'), 3000);
            return;
        }

        setIsUploading(true);
        setUploadStatus('idle');
        setUploadMessage('');

        try {
            const parsedData = await parsePDFToDashboardData(file);

            if (!parsedData) {
                throw new Error('Failed to parse PDF data');
            }

            // Update all dashboard data
            updateAllData(parsedData);

            setUploadStatus('success');
            setUploadMessage(`Successfully loaded data from ${file.name}`);

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            setTimeout(() => setUploadStatus('idle'), 5000);
        } catch (error) {
            console.error('Error uploading PDF:', error);
            setUploadStatus('error');
            setUploadMessage(error instanceof Error ? error.message : 'Failed to parse PDF');
            setTimeout(() => setUploadStatus('idle'), 5000);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-4xl mx-auto mt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
                <div className="flex items-center space-x-2">
                    {/* PDF Upload Button */}
                    <div className="relative">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf"
                            onChange={handlePDFUpload}
                            className="hidden"
                            id="pdf-upload"
                        />
                        <label
                            htmlFor="pdf-upload"
                            className={`flex items-center px-4 py-2 text-sm font-semibold rounded-lg cursor-pointer transition-colors ${isUploading
                                ? 'bg-blue-100 text-blue-400 cursor-wait'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            {isUploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Upload size={16} className="mr-2" />
                                    Upload PDF
                                </>
                            )}
                        </label>
                    </div>

                    <button
                        onClick={resetData}
                        className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                        Reset to Default
                    </button>
                </div>
            </div>

            {/* Upload Status Message */}
            {uploadStatus !== 'idle' && (
                <div className={`mb-4 p-4 rounded-xl flex items-start ${uploadStatus === 'success'
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-rose-50 border border-rose-200'
                    }`}>
                    {uploadStatus === 'success' ? (
                        <CheckCircle className="text-emerald-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
                    ) : (
                        <AlertCircle className="text-rose-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
                    )}
                    <div>
                        <p className={`text-sm font-semibold ${uploadStatus === 'success' ? 'text-emerald-900' : 'text-rose-900'
                            }`}>
                            {uploadStatus === 'success' ? 'Success!' : 'Error'}
                        </p>
                        <p className={`text-xs mt-1 ${uploadStatus === 'success' ? 'text-emerald-700' : 'text-rose-700'
                            }`}>
                            {uploadMessage}
                        </p>
                    </div>
                </div>
            )}

            <div className="flex space-x-4 mb-6 border-b border-slate-200 pb-2">
                <button
                    onClick={() => setActiveTab('branches')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg ${activeTab === 'branches' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}
                >
                    Branch Data
                </button>
                <button
                    onClick={() => setActiveTab('website')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg ${activeTab === 'website' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}
                >
                    Website Data
                </button>
            </div>

            {activeTab === 'branches' && (
                <div>
                    <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                        {data.branches && data.branches.map((b, idx) => (
                            <button
                                key={b.name}
                                onClick={() => setSelectedBranchIdx(idx)}
                                className={`px-3 py-1.5 text-sm whitespace-nowrap rounded-full border ${selectedBranchIdx === idx ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}
                            >
                                {b.name}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6">
                        {!branchForm ? (
                            <div className="text-red-500">Error: No branch data selected or available.</div>
                        ) : (
                            <>
                                <h3 className="text-lg font-bold text-slate-800">
                                    Editing: {branchForm.name}
                                    <span className="ml-2 text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                        (Auto-calculated: Sales {branchForm.totalSales.toFixed(2)}, Orders {branchForm.totalOrders})
                                    </span>
                                </h3>

                                {branchForm.channels.map((channel, cIdx) => (
                                    <div key={channel.name} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-bold text-slate-700">{channel.name}</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1">Sales</label>
                                                <input
                                                    type="number"
                                                    value={channel.sales}
                                                    onChange={(e) => handleBranchChannelChange(cIdx, 'sales', parseFloat(e.target.value) || 0)}
                                                    className="w-full p-2 border border-slate-300 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1">Orders</label>
                                                <input
                                                    type="number"
                                                    value={channel.orders}
                                                    onChange={(e) => handleBranchChannelChange(cIdx, 'orders', parseFloat(e.target.value) || 0)}
                                                    className="w-full p-2 border border-slate-300 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1 text-rose-600">Cancelled Orders</label>
                                                <input
                                                    type="number"
                                                    value={channel.cancelledOrders || 0}
                                                    onChange={(e) => handleBranchChannelChange(cIdx, 'cancelledOrders', parseFloat(e.target.value) || 0)}
                                                    className="w-full p-2 border border-rose-100 bg-rose-50 text-rose-700 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1 text-rose-600">Cancelled Value</label>
                                                <input
                                                    type="number"
                                                    value={channel.cancelledValue || 0}
                                                    onChange={(e) => handleBranchChannelChange(cIdx, 'cancelledValue', parseFloat(e.target.value) || 0)}
                                                    className="w-full p-2 border border-rose-100 bg-rose-50 text-rose-700 rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={saveBranch}
                                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                                >
                                    Save Changes to {branchForm.name}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'website' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Main Stats */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <h4 className="font-bold text-slate-700 mb-4">Traffic & Sales</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Total Visits</label>
                                    <input
                                        type="number"
                                        value={websiteForm.visits}
                                        onChange={(e) => handleWebsiteChange('visits', parseFloat(e.target.value) || 0)}
                                        className="w-full p-2 border border-slate-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Total Sales</label>
                                    <input
                                        type="number"
                                        value={websiteForm.totalSales}
                                        onChange={(e) => handleWebsiteChange('totalSales', parseFloat(e.target.value) || 0)}
                                        className="w-full p-2 border border-slate-300 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <h4 className="font-bold text-slate-700 mb-4">Order Funnel</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Total Orders</label>
                                    <input
                                        type="number"
                                        value={websiteForm.totalOrders}
                                        onChange={(e) => handleWebsiteChange('totalOrders', parseFloat(e.target.value) || 0)}
                                        className="w-full p-2 border border-slate-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Completed Orders</label>
                                    <input
                                        type="number"
                                        value={websiteForm.completedOrders}
                                        onChange={(e) => handleWebsiteChange('completedOrders', parseFloat(e.target.value) || 0)}
                                        className="w-full p-2 border border-slate-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Cancelled Orders</label>
                                    <input
                                        type="number"
                                        value={websiteForm.cancelledOrders}
                                        onChange={(e) => handleWebsiteChange('cancelledOrders', parseFloat(e.target.value) || 0)}
                                        className="w-full p-2 border border-slate-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Cancelled Value</label>
                                    <input
                                        type="number"
                                        value={websiteForm.cancelledValue}
                                        onChange={(e) => handleWebsiteChange('cancelledValue', parseFloat(e.target.value) || 0)}
                                        className="w-full p-2 border border-slate-300 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={saveWebsite}
                        className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                        Save Website Stats
                    </button>
                </div>
            )}
        </div>
    );
};
