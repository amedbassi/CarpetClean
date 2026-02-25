'use client';

import { Truck, ClipboardList, Hammer, LayoutDashboard, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
    const pathname = usePathname();

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
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
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
