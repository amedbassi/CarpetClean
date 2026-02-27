'use client';

import Header from '@/components/Header';
import DeliveryForm from '@/components/DeliveryForm';
import { useLanguage } from '@/lib/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">{t.intake.landing_title}</h2>
          <p className="text-gray-600">{t.intake.landing_subtitle}</p>
        </div>
        <DeliveryForm />
      </main>
    </div>
  );
}
