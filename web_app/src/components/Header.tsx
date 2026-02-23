'use client';

import { Truck, ClipboardList, Hammer } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
    const pathname = usePathname();

    const tabs = [
        { name: 'Intake', href: '/', icon: ClipboardList },
        { name: 'Operations', href: '/operations', icon: ClipboardList },
        { name: 'Repair', href: '/repair', icon: Hammer },
        { name: 'Delivery', href: '/delivery', icon: Truck },
        { name: 'Data', href: '/data', icon: ClipboardList },
    ];

    const formattedToday = (() => {
        const date = new Date();
        return new Intl.DateTimeFormat('en-CH', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(date);
    })();

    return (
        <header className="bg-blue-500 text-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-white/10 border border-white/20 shadow-sm">
                            <Truck className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                                CarpetClean Pro
                            </h1>
                            <p className="text-xs md:text-sm text-blue-100">
                                Internal workflow for Geneva cleaning team
                            </p>
                        </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end text-xs md:text-sm">
                        <span className="uppercase tracking-wide text-blue-100 font-semibold">
                            Today
                        </span>
                        <span className="font-medium">
                            {formattedToday}
                        </span>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <nav className="flex space-x-1 border-t border-blue-400/40">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={`flex items-center space-x-2 px-3 md:px-4 py-2.5 text-xs md:text-sm font-medium transition-colors rounded-t-md ${isActive
                                    ? 'bg-blue-600/90 text-white border-b-2 border-white'
                                    : 'text-blue-100/80 hover:bg-blue-500/70 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
