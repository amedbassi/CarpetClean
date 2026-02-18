import RugDetailForm from '@/components/RugDetailForm';
import Header from '@/components/Header';

export default async function RugPage({
    params,
}: {
    params: Promise<{ id: string; itemId: string }>
}) {
    const { id, itemId } = await params;

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <Header />
            <div className="container mx-auto px-4 py-6">
                <RugDetailForm orderId={id} itemId={itemId} />
            </div>
        </div>
    );
}
