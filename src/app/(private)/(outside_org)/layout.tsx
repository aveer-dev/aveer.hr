export default function RootLayout({ children }: { children: React.ReactNode; params: { [key: string]: string } }) {
	return <>{children}</>;
}
