import type { Metadata } from 'next';
import { Karla } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/react';

const karla = Karla({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Aveer.hr',
	description: 'HR Service for everyone'
};

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
