// src/types/index.ts

export interface LineMessage {
	date: string;
	time: string;
	sender: string;
	content: string;
}

export interface DateStats {
	date: string;
	messageCount: number;
}
