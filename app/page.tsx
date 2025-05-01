'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const router = useRouter();

  const handleStartPlanning = () => {
    router.push('/planner');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-sky-100 to-blue-200 p-4">
      <div className="bg-white shadow-x1 rounded-2xl p-8 max-w-md text-center">
        <h1 className="text-4xl font-bold text-blue-800 mb-4">Daily Planner</h1>
        <p className="text-gray-600 mb-6">
          จัดการงาน สิ่งที่ต้องจำ และกิจกรรมในแต่ละวันด้วย Daily Planner
        </p>
        <Button className="w-full" onClick={handleStartPlanning}>
          คลิกเพื่อเริ่ม 🚀
        </Button>
      </div>
    </main>
  );
}
