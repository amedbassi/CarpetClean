import RepairEstimateForm from '@/components/RepairEstimateForm';
import Header from '@/components/Header';

export default async function RepairEstimatePage({
    params,
}: {
    params: Promise<{ id: string; itemId: string }>
}) {
    const { id, itemId } = await params;

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <Header />
            <div className="container mx-auto px-4 py-6">
                <RepairEstimateForm orderId={id} itemId={itemId} />
            </div>
        </div>
    );
}
