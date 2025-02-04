import './style.scss';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, PenToolIcon, Signature, Upload, X } from 'lucide-react';
import { ChangeEvent, useCallback, useRef, useState } from 'react';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import SignatureCanvas from 'react-signature-canvas';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const SignaturePad = ({ onUpload, fullName }: { onUpload: (url: string, id: string) => void; fullName: string }) => {
	const [drawerIsOpen, toggleDrawerState] = useState(false);
	const [name, setName] = useState(fullName);
	const [signaturePadRef, setSignaturePadRef] = useState<SignatureCanvas | null>();
	const [isSigning, setSigningState] = useState(false);
	const [signatureType, setSignatureType] = useState('draw');
	const ref = useRef<HTMLDivElement>(null);

	const signContract = async () => {
		if (signatureType == 'draw') {
			const dataURL = signaturePadRef?.toDataURL();
			const figure = ref.current?.closest('div[data-type="signatureFigure"]');
			const id = figure?.getAttribute('data-id')!;
			if (dataURL) onUpload(dataURL, id);
			toggleDrawerState(false);
		}
	};

	return (
		<div ref={ref} className={'flex w-52 flex-col items-center justify-center gap-4 rounded-md border bg-secondary py-4'} contentEditable={false}>
			<Signature size={28} className="text-primary opacity-80" />

			<Drawer dismissible={false} open={drawerIsOpen} onOpenChange={toggleDrawerState}>
				<DrawerTrigger asChild>
					<Button className="w-24 gap-2" variant={'outline'}>
						<PenToolIcon size={12} />
						Sign
					</Button>
				</DrawerTrigger>

				<DrawerContent>
					<section className="mx-auto max-w-sm p-4">
						<DrawerHeader className="gap-3 p-0 pb-4">
							<DrawerTitle>Sign Document</DrawerTitle>
							<DrawerDescription className="text-xs font-light leading-6">Adopt a signature below to add your signature to document</DrawerDescription>
						</DrawerHeader>

						<Tabs defaultValue={signatureType} className="w-full" onValueChange={setSignatureType}>
							<TabsList className="grid w-fit grid-cols-2">
								<TabsTrigger value="draw">Draw signature</TabsTrigger>
								<TabsTrigger value="type">Type signature</TabsTrigger>
							</TabsList>

							<TabsContent value="draw">
								<div className="relative">
									{signaturePadRef && (
										<Button className="absolute right-1 top-0" variant={'ghost'} onClick={signaturePadRef?.clear}>
											Clear
										</Button>
									)}
									<SignatureCanvas ref={ref => setSignaturePadRef(ref)} penColor="black" canvasProps={{ height: 300, className: 'border-l w-full border-r my-4' }} />
								</div>
							</TabsContent>

							<TabsContent value="type" className="w-full">
								<input
									type="text"
									placeholder="Enter your legal full name"
									name="signature-string"
									autoComplete="off"
									required
									value={name}
									onChange={event => setName(event.target.value)}
									id="signature-string"
									aria-label="Signature text"
									className="signature my-7 w-full border-b border-b-foreground text-2xl outline-none placeholder:font-karla"
								/>
							</TabsContent>
						</Tabs>

						<DrawerFooter className="grid grid-cols-2 items-center gap-4 px-0">
							<DrawerClose asChild>
								<Button type="button" onClick={() => toggleDrawerState(!drawerIsOpen)} variant="outline">
									Cancel
								</Button>
							</DrawerClose>

							<Button size={'sm'} disabled={signaturePadRef?.isEmpty() && name == ''} className="px-8 text-xs font-light" onClick={signContract}>
								{isSigning ? 'Signing contract' : 'Sign contract'}
							</Button>
						</DrawerFooter>
					</section>
				</DrawerContent>
			</Drawer>
		</div>
	);
};

export default SignaturePad;
