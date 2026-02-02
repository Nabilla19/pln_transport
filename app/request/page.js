export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import RequestFormClient from './RequestFormClient';

export default function RequestPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center">Memuat formulir...</div>}>
            <RequestFormClient />
        </Suspense>
    );
}
