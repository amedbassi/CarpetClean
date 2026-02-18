import Header from '@/components/Header';
import DeliveryDashboard from '@/components/DeliveryDashboard';

export default function DeliveryPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <Header />
            <main className="container mx-auto px-4 py-6">
                <DeliveryDashboard />
            </main>
        </div>
    );
}
