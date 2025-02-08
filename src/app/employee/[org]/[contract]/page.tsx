'use client';

import { PageLoader } from '@/components/ui/page-loader';
import { useRouter } from 'next/navigation';

export default function ContractorPage() {
	const router = useRouter();

	router.push('./home');

	return <PageLoader isLoading={true} />;
}
