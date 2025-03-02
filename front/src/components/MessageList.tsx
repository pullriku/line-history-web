// src/components/MessageList.tsx
import { useRef, useEffect } from "preact/hooks";
import type { LineMessage } from "../types";
import Message from "./Message";
import SystemMessage from "./SystemMessage";
import { getRandomDarkColor } from "../lib/color";

interface MessageListProps {
	messages: LineMessage[];
}

export default function MessageList({
	messages,
}: MessageListProps): JSX.Element {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const uniqueSendersSet = new Set(messages.map((msg) => msg.sender));
	uniqueSendersSet.delete("");
	const uniqueSenders = [...uniqueSendersSet];

	const uniqueColors = uniqueSenders.map(getRandomDarkColor);
	const sender2Color: Record<string, string> = {};
	uniqueSenders.forEach((sender, index) => {
		sender2Color[sender] = uniqueColors[index];
	});

	useEffect(() => {
		// メッセージリストが更新されたら一番上にスクロール
		if (containerRef.current) {
			containerRef.current.scrollTop = 0;
		}
	}, [messages]);

	if (!messages || messages.length === 0) {
		return (
			<div class="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
				選択した日付のメッセージがありません。別の日付を選択してください。
			</div>
		);
	}

	// メッセージを日付ごとにグループ化
	const messagesByDate: Record<string, LineMessage[]> = {};
	messages.forEach((msg) => {
		if (!messagesByDate[msg.date]) {
			messagesByDate[msg.date] = [];
		}
		messagesByDate[msg.date].push(msg);
	});

	// メッセージ数を表示するヘルパー関数
	const getMessageCount = (): string => {
		return `${messages.length} メッセージ`;
	};

	return (
		<div class="bg-white rounded-lg shadow-md overflow-hidden">
			<div class="bg-indigo-600 p-3 text-white flex items-center justify-between">
				<div class="flex items-center">
					<h2 class="font-medium">{uniqueSenders.join(", ")}</h2>
				</div>
				<div class="text-xs px-2 py-1 rounded-full">
					{getMessageCount()}
				</div>
			</div>

			<div
				ref={containerRef}
				class="p-4 h-max bg-gray-50"
			>
				{Object.entries(messagesByDate).map(([date, dateMessages]) => (
					<div key={date}>
						<div class="text-center my-4">
							<span class="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs">
								{date}
							</span>
						</div>

						{dateMessages.map((msg, index) => (
							msg.sender !== ""
								? <Message key={`${date}-${index}`} message={msg} iconBgColor={sender2Color[msg.sender]} />
								: <SystemMessage message={msg} />
						))}
					</div>
				))}
			</div>
		</div>
	);
}
