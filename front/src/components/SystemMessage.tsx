import type { LineMessage } from "../types";

interface SystemMessageProps {
    message: LineMessage;
}

export default function SystemMessage({ message }: SystemMessageProps): JSX.Element {
    return (
        <div class="mb-4 text-center text-gray-500">
            {message.content}
        </div>
    )
}
