import type { Metadata } from 'next';
import { Karla } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';
import './styles.css';

import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/react';
import { pdfjs } from 'react-pdf';

const karla = Karla({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Aveer.hr',
	description: 'HR Service for everyone'
};

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en">
			<body className={cn(karla.className)}>
				<Toaster toastOptions={{ className: `${karla.className} !font-thin bg-background text-foreground border-none text-xs font-karla` }} />

				{children}

				<Analytics />
			</body>
		</html>
	);
}
