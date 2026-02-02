import { Suspense } from 'react';
import MyRequestsClient from './MyRequestsClient';

export default function MyRequestsPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center">Memuat permohonan...</div>}>
            <MyRequestsClient />
        </Suspense>
    );
}
