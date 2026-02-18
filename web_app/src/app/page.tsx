import Header from '@/components/Header';
import DeliveryForm from '@/components/DeliveryForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">New Item Receipt</h2>
          <p className="text-gray-600">Enter details for received rugs/carpets</p>
        </div>
        <DeliveryForm />
      </main>
    </div>
  );
}
