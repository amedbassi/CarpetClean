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

    return (
        <header className="bg-blue-500 text-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-2">
                        <Truck className="h-7 w-7" />
                        <h1 className="text-2xl font-bold tracking-tight">CarpetClean Pro</h1>
                    </div>
                    <div className="text-base font-medium">
                        {new Date().toLocaleDateString()}
                    </div>
                </div>

                {/* Navigation Tabs */}
                <nav className="flex space-x-1 border-t border-blue-500">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${isActive
                                    ? 'bg-blue-700 text-white border-b-2 border-white'
                                    : 'text-blue-100 hover:bg-blue-500 hover:text-white'
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
