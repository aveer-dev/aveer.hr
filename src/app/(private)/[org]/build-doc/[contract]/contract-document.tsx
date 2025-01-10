'use client';

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import dynamic from 'next/dynamic';
const PDFViewer = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFViewer), {
	ssr: false,
	loading: () => <p>Loading...</p>
});

export const ContractDocument = () => {
	return (
		<Document style={{ border: 'none' }}>
			<Page size="A4">
				<View>
					<Text>Section #1</Text>
				</View>
				<View>
					<Text>Section #2</Text>
				</View>
			</Page>
		</Document>
	);
};

export const ContractViewer = () => {
	return (
		<PDFViewer>
			<ContractDocument />
		</PDFViewer>
	);
};
