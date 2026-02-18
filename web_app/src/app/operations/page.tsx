import OperationsDashboard from '@/components/OperationsDashboard';
import Header from '@/components/Header';

export default function OperationsPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <Header />
            <div className="container mx-auto px-4 py-6">
                <OperationsDashboard />
            </div>
        </div>
    );
}
