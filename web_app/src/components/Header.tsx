'use client';

import { Truck, ClipboardList, Hammer, LayoutDashboard, BarChart3, Settings, DollarSign, Mail, Save, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

interface SettingsData {
    pricePerSquareMeter: number;
    repairHourlyRate: number;
    taxRate: number;
    currency: string;
    emailFrom: string;
    emailHost: string;
    emailPort: number;
    emailUser: string;
    emailPassword: string;
}

export default function Header() {
    const pathname = usePathname();
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState<SettingsData>({
        pricePerSquareMeter: 25.0,
        repairHourlyRate: 50.0,
        taxRate: 7.7,
        currency: 'CHF',
        emailFrom: '',
        emailHost: '',
        emailPort: 587,
        emailUser: '',
        emailPassword: '',
    });
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showSettings) {
            loadSettings();
        }
    }, [showSettings]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSettings(false);
            }
        };

        if (showSettings) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSettings]);

    const loadSettings = async () => {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const saveSettings = async () => {
        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (response.ok) {
                alert('Settings saved!');
                setShowSettings(false);
            } else {
                alert('Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error saving settings');
        }
    };

    const tabs = [
        { name: 'Intake', href: '/', icon: ClipboardList },
        { name: 'Operations', href: '/operations', icon: LayoutDashboard },
        { name: 'Repair', href: '/repair', icon: Hammer },
        { name: 'Delivery', href: '/delivery', icon: Truck },
        { name: 'Data Insights', href: '/data', icon: BarChart3 },
    ];

    const formattedToday = new Intl.DateTimeFormat('en-CH', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo Area */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-600 shadow-lg shadow-blue-200 text-white">
                            <SparklesLogo className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">
                                CarpetClean <span className="text-blue-600">Pro</span>
                            </h1>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-1">
                                Geneva Operations
                            </p>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
                            return (
                                <Link
                                    key={tab.name}
                                    href={tab.href}
                                    className={`flex items-center space-x-2.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                    <span>{tab.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Utility / Date */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden lg:flex flex-col items-end border-r border-gray-200 pr-4 mr-2">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Switzerland</span>
                            <span className="text-xs font-semibold text-gray-600">{formattedToday}</span>
                        </div>
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setShowSettings(!showSettings)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            >
                                <Settings className="w-5 h-5" />
                            </button>

                            {showSettings && (
                                <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4 flex items-center justify-between">
                                        <h3 className="text-white font-bold text-lg">Quick Settings</h3>
                                        <button 
                                            onClick={() => setShowSettings(false)}
                                            className="text-white/80 hover:text-white transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                                        {/* Pricing Section */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                                                <DollarSign className="w-4 h-4" />
                                                Pricing
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                    Cleaning (per m²)
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={settings.pricePerSquareMeter}
                                                        onChange={e => setSettings({ ...settings, pricePerSquareMeter: parseFloat(e.target.value) })}
                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                                                        {settings.currency}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                    Repair (hourly)
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={settings.repairHourlyRate}
                                                        onChange={e => setSettings({ ...settings, repairHourlyRate: parseFloat(e.target.value) })}
                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                                                        {settings.currency}/hr
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                        Tax (%)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={settings.taxRate}
                                                        onChange={e => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                        Currency
                                                    </label>
                                                    <select
                                                        value={settings.currency}
                                                        onChange={e => setSettings({ ...settings, currency: e.target.value })}
                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold"
                                                    >
                                                        <option value="CHF">CHF</option>
                                                        <option value="EUR">EUR</option>
                                                        <option value="USD">USD</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200"></div>

                                        {/* Email Section */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                                                <Mail className="w-4 h-4" />
                                                Email (SMTP)
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                    From Email
                                                </label>
                                                <input
                                                    type="email"
                                                    placeholder="business@example.com"
                                                    value={settings.emailFrom || ''}
                                                    onChange={e => setSettings({ ...settings, emailFrom: e.target.value })}
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                />
                                            </div>

                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="col-span-2 space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                        SMTP Host
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="smtp.gmail.com"
                                                        value={settings.emailHost || ''}
                                                        onChange={e => setSettings({ ...settings, emailHost: e.target.value })}
                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                        Port
                                                    </label>
                                                    <input
                                                        type="number"
                                                        placeholder="587"
                                                        value={settings.emailPort || ''}
                                                        onChange={e => setSettings({ ...settings, emailPort: parseInt(e.target.value) })}
                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                    Username
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="your-email@gmail.com"
                                                    value={settings.emailUser || ''}
                                                    onChange={e => setSettings({ ...settings, emailUser: e.target.value })}
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                    Password
                                                </label>
                                                <input
                                                    type="password"
                                                    placeholder="••••••••••••"
                                                    value={settings.emailPassword || ''}
                                                    onChange={e => setSettings({ ...settings, emailPassword: e.target.value })}
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                                        <button
                                            onClick={saveSettings}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                                        >
                                            <Save className="w-4 h-4" />
                                            Save Settings
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

function SparklesLogo({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1" />
        </svg>
    );
}
