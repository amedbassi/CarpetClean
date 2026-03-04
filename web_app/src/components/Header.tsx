'use client';

import { Truck, ClipboardList, Hammer, LayoutDashboard, BarChart3, Settings, DollarSign, Mail, Save, X, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { translations } from '@/lib/translations';

interface SettingsData {
    priceWool: number;
    priceSilk: number;
    priceCotton: number;
    priceSynthetic: number;
    priceOther: number;
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
    const { language, setLanguage, t } = useLanguage();
    const pathname = usePathname();
    const [showSettings, setShowSettings] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [settings, setSettings] = useState<SettingsData>({
        priceWool: 27.0,
        priceSilk: 47.0,
        priceCotton: 24.0,
        priceSynthetic: 20.0,
        priceOther: 30.0,
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
        setMounted(true);
    }, []);

    useEffect(() => {
        if (showSettings) {
            loadSettings();
        }
    }, [showSettings]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            // Only handle click outside on desktop (md and up)
            if (window.innerWidth >= 768 && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSettings(false);
            }
        };

        if (showSettings) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
            // Prevent body scroll when settings open on mobile
            if (window.innerWidth < 768) {
                document.body.style.overflow = 'hidden';
            }
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.body.style.overflow = '';
        };
    }, [showSettings]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (showMobileMenu) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showMobileMenu]);

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
        { name: t.header.intake, href: '/', icon: ClipboardList },
        { name: t.header.operations, href: '/operations', icon: LayoutDashboard },
        { name: t.header.repair, href: '/repair', icon: Hammer },
        { name: t.header.delivery, href: '/delivery', icon: Truck },
        { name: t.header.insights, href: '/data', icon: BarChart3 },
    ];

    const formattedToday = mounted
        ? new Intl.DateTimeFormat(language === 'fr' ? 'fr-CH' : 'en-CH', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(new Date())
        : '';

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            aria-label="Toggle menu"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Logo Area */}
                        <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-blue-600 shadow-lg shadow-blue-200 text-white">
                            <SparklesLogo className="h-4 w-4 sm:h-6 sm:w-6" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight leading-none">
                                CarpetClean <span className="text-blue-600">Pro</span>
                            </h1>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-1">
                                {t.common.geneva}
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
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="hidden lg:flex flex-col items-end border-r border-gray-200 pr-4 mr-2">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.common.switzerland}</span>
                            <span className="text-xs font-semibold text-gray-600">{formattedToday}</span>
                        </div>
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                aria-label="Settings"
                            >
                                <Settings className="w-5 h-5" />
                            </button>

                            {showSettings && (
                                <>
                                    {/* Mobile Overlay */}
                                    <div
                                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                                        onClick={() => setShowSettings(false)}
                                    />
                                    <div className="fixed inset-0 md:absolute md:inset-auto md:right-0 md:mt-2 md:w-96 bg-white md:rounded-2xl shadow-2xl border-0 md:border md:border-gray-200 z-50 overflow-hidden flex flex-col">
                                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4 flex items-center justify-between flex-shrink-0">
                                            <h3 className="text-white font-bold text-lg">{t.header.settings}</h3>
                                            <button
                                                onClick={() => setShowSettings(false)}
                                                className="text-white/80 hover:text-white transition-colors p-2 -mr-2"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div 
                                            className="p-4 sm:p-5 space-y-5 flex-1 overflow-y-auto overscroll-contain"
                                            style={{ WebkitOverflowScrolling: 'touch' }}
                                        >
                                        {/* Pricing Section */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                                                    <DollarSign className="w-4 h-4" />
                                                    {t.header.prices}
                                                </div>
                                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                                    <button
                                                        onClick={() => setLanguage('en')}
                                                        className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${language === 'en' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                                                    >
                                                        EN
                                                    </button>
                                                    <button
                                                        onClick={() => setLanguage('fr')}
                                                        className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${language === 'fr' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                                                    >
                                                        FR
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                        {t.rug_details.materials.wool}
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={settings.priceWool}
                                                            onChange={e => setSettings({ ...settings, priceWool: parseFloat(e.target.value) })}
                                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                                                            {settings.currency}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                        {t.rug_details.materials.silk}
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={settings.priceSilk}
                                                            onChange={e => setSettings({ ...settings, priceSilk: parseFloat(e.target.value) })}
                                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                                                            {settings.currency}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                        {t.rug_details.materials.cotton}
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={settings.priceCotton}
                                                            onChange={e => setSettings({ ...settings, priceCotton: parseFloat(e.target.value) })}
                                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                                                            {settings.currency}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                        {t.rug_details.materials.synthetic}
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={settings.priceSynthetic}
                                                            onChange={e => setSettings({ ...settings, priceSynthetic: parseFloat(e.target.value) })}
                                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                                                            {settings.currency}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                        {t.rug_details.materials.other}
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={settings.priceOther}
                                                            onChange={e => setSettings({ ...settings, priceOther: parseFloat(e.target.value) })}
                                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                                                            {settings.currency}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2 pt-2">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                    {t.header.hourly_rate}
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

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                        {t.header.tax}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={settings.taxRate}
                                                        onChange={e => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                                                        className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                        {t.header.currency}
                                                    </label>
                                                    <select
                                                        value={settings.currency}
                                                        onChange={e => setSettings({ ...settings, currency: e.target.value })}
                                                        className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold"
                                                    >
                                                        <option value="CHF">CHF</option>
                                                        <option value="EUR">EUR</option>
                                                        <option value="USD">USD</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>


                                        </div>

                                        <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
                                            <button
                                                onClick={saveSettings}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:bg-blue-800 transition-all shadow-lg shadow-blue-100"
                                            >
                                                <Save className="w-4 h-4" />
                                                {t.header.save_settings}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )
                            }
                        </div >
                    </div >
                </div >
            </div >
        </header >

            {/* Mobile Navigation Menu */}
            {showMobileMenu && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setShowMobileMenu(false)}
                    />
                    {/* Slide-in Menu */}
                    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300">
                        <div className="flex flex-col h-full">
                            {/* Menu Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600 text-white">
                                        <SparklesLogo className="h-5 w-5" />
                                    </div>
                                    <span className="font-bold text-gray-900">CarpetClean</span>
                                </div>
                                <button
                                    onClick={() => setShowMobileMenu(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                                    aria-label="Close menu"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Navigation Links */}
                            <nav className="flex-1 overflow-y-auto py-4">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
                                    return (
                                        <Link
                                            key={tab.name}
                                            href={tab.href}
                                            onClick={() => setShowMobileMenu(false)}
                                            className={`flex items-center space-x-3 px-4 py-3 mx-2 rounded-lg text-base font-semibold transition-all ${isActive
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <span>{tab.name}</span>
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* Menu Footer */}
                            <div className="border-t border-gray-200 p-4">
                                <div className="text-xs text-gray-500 text-center">
                                    <div className="font-semibold">{t.common.switzerland}</div>
                                    <div>{formattedToday}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
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
