// src/components/Message.tsx
import type { LineMessage } from "../types";

interface MessageProps {
	message: LineMessage;
}

export default function Message({ message }: MessageProps): JSX.Element {
	// URLをリンクに変換する関数
	const linkifyContent = (content: string): (string | JSX.Element)[] => {
		const urlRegex = /(https?:\/\/[^\s]+)/g;
		return content.split(urlRegex).map((part, i) => {
			if (part.match(urlRegex)) {
				return (
					<a
						href={part}
						target="_blank"
						rel="noopener noreferrer"
						class="text-blue-500 underline"
						key={i}
					>
						{part}
					</a>
				);
			}
			return part;
		});
	};

	return (
		<div class="mb-4">
			<div class="flex items-center mb-1">
				{/* 送信者のアバター */}
				<div class="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs mr-2">
					{message.sender.charAt(0)}
				</div>

				{/* 送信者名 */}
				<span class="text-sm font-medium">{message.sender}</span>

				{/* 時間 */}
				<span class="text-xs text-gray-500 ml-2">{message.time}</span>
			</div>

			{/* メッセージ本文 */}
			<div class="bg-white border border-gray-200 rounded-lg p-3 ml-8 whitespace-pre-wrap break-words">
				{linkifyContent(message.content)}
			</div>
		</div>
	);
}
