// src/components/FileUpload.tsx
import { useState } from "preact/hooks";

interface FileUploadProps {
	onFileRead: (content: string) => void;
}

export default function FileUpload({
	onFileRead,
}: FileUploadProps): JSX.Element {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleFileChange = (e: Event): void => {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		setIsLoading(true);

		const reader = new FileReader();
		reader.onload = (event: ProgressEvent<FileReader>): void => {
			const content = event.target?.result as string;
			onFileRead(content);
			setIsLoading(false);
		};

		reader.onerror = (): void => {
			setIsLoading(false);
			alert("ファイルの読み込みに失敗しました。");
		};

		reader.readAsText(file);
	};

	return (
		<div>
			<label class="block">
				<span class="text-gray-700 font-medium">
					履歴ファイル (.txt) を選択:
				</span>
				<input
					type="file"
					accept=".txt"
					onChange={handleFileChange}
					disabled={isLoading}
					class="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
				/>
			</label>
		</div>
	);
}
