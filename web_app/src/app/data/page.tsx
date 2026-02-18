import DataReviewDashboard from '@/components/DataReviewDashboard';
import Header from '@/components/Header';

export default function DataPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <Header />
            <div className="container mx-auto px-4 py-6">
                <DataReviewDashboard />
            </div>
        </div>
    );
}
