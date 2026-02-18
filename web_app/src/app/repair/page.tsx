import RepairDashboard from '@/components/RepairDashboard';
import Header from '@/components/Header';

export default function RepairPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <Header />
            <div className="container mx-auto px-4 py-6">
                <RepairDashboard />
            </div>
        </div>
    );
}
