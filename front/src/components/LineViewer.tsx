// src/components/LineViewer.tsx
import { useState } from "preact/hooks";
import type { LineMessage } from "../types";
import MessageList from "./MessageList";
import FileUpload from "./FileUpload";
import DateSelector from "./DateSelector";
import initRustBind, * as rustBind from "../../../rust-bind/pkg/rust_bind";

export default function LineViewer(): JSX.Element {
	const [messages, setMessages] = useState<LineMessage[]>([]);
	const [history, setHistory] = useState<rustBind.History | undefined>(
		undefined,
	);

	const [hasFile, setHasFile] = useState<boolean>(false);
	const [availableDates, setAvailableDates] = useState<string[]>([]);
	const [selectedDate, setSelectedDate] = useState<string>("");

	// 日付でメッセージをフィルタリングする関数
	const filterMessagesByDate = (date: string): void => {
		setSelectedDate(date);
		if (date === "") {
			// すべての日付を選択した場合
		} else {
			// 特定の日付のみをフィルタリング
			const day = history?.search_by_date(stringToDate(date));
			if (day) {
				setMessages(dayToMessage(day));
			} else {
				console.error(
					`Failed to search by date: ${date}, dateStr: ${date}, history: ${history}, strToDate: ${stringToDate(date).day0}`,
				);
			}
		}
	};

	// ファイルが選択されたときのハンドラ
	const handleFileRead = async (content: string): Promise<void> => {
		await initRustBind();
		const history = rustBind.History.from_text(content);
		setHistory(history);
		// const parsedMessages = history ? parseLineChat(history) : [];
		const dates = history ? getAvailableDates(history) : [];

		// setAllMessages(parsedMessages);
		setAvailableDates(dates);

		// 最初は最新日付のメッセージのみを表示
		if (dates.length > 0 && history) {
			setSelectedDate(dates[0]);
			const date = history.search_by_date(stringToDate(dates[0]))!;
			if (date) {
				setMessages(dayToMessage(date));
			} else {
				console.error(`Failed to search by date: ${dates[0]}`);
			}
		}

		setHasFile(true);
	};

	return (
		<div>
			<div class="bg-white rounded-lg shadow-md p-6 mb-6">
				<FileUpload onFileRead={handleFileRead} />
			</div>

			{hasFile && availableDates.length > 0 && (
				<DateSelector
					dates={availableDates}
					selectedDate={selectedDate}
					onSelectDate={filterMessagesByDate}
				/>
			)}

			{hasFile && <MessageList messages={messages} />}
		</div>
	);
}

function dayToMessage(day: rustBind.Day): LineMessage[] {
	return day.chats().map((chat) => {
		return {
			date: dateToString(day.date()),
			time: timeToString(chat.time()),
			sender: chat.speaker() ?? "",
			content: chat.content(),
		};
	});
}

function dateToString(date: rustBind.Date): string {
	const { year, month0, day0 } = date;
	const { yearStr, monthStr, dayStr } = {
		yearStr: year.toString().padStart(4, "0"),
		monthStr: (month0 + 1).toString().padStart(2, "0"),
		dayStr: (day0 + 1).toString().padStart(2, "0"),
	};
	return `${yearStr}-${monthStr}-${dayStr}`;
}

function stringToDate(dateStr: string): rustBind.Date {
	const [year, month, day] = dateStr.split("-").map(Number);
	return new rustBind.Date(year, month - 1, day - 1);
}

function timeToString(time: rustBind.Time): string {
	const { hour, minute } = time;
	const { hourStr, minuteStr } = {
		hourStr: hour.toString().padStart(2, "0"),
		minuteStr: minute.toString().padStart(2, "0"),
	};
	return `${hourStr}:${minuteStr}`;
}

// 利用可能な日付を抽出する関数
function getAvailableDates(history: rustBind.History): string[] {
  return history.available_dates().map(dateToString);
};
