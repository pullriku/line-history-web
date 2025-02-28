// src/components/CalendarDateSelector.tsx
import { useState } from "preact/hooks";

interface CalendarDateSelectorProps {
  dates: string[]; // 例："2025-02-28" のようなフォーマット
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export default function CalendarDateSelector({
  dates,
  selectedDate,
  onSelectDate,
}: CalendarDateSelectorProps): JSX.Element {
  // 選択済みの日付があればその月、なければ本日を初期値にする
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );
  // ドロップダウンで月選択するモードかどうか
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  // 日付を "YYYY-MM-DD" 形式に変換するヘルパー
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 月の値を "YYYY-MM" 形式に変換
  const formatMonth = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };

  // 指定月の日付リストを生成
  const getDaysInMonth = (year: number, month: number): Date[] => {
    const date = new Date(year, month, 1);
    const days: Date[] = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const daysInMonth = getDaysInMonth(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
  );
  // カレンダーの先頭に空セルを補完（1日の曜日位置に合わせる）
  const firstDayOfWeek = currentMonth.getDay(); // 0:日曜, 1:月曜, ...
  const calendarCells: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  calendarCells.push(...daysInMonth);

  // 7列表示のため、行ごとにグループ化
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  // 指定の日付が選択可能か（dates 配列に含まれるかどうか）を判定
  const isAvailable = (date: Date): boolean => dates.includes(formatDate(date));

  // 月移動のハンドラー
  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };
  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6 touch-manipulation">
      {/* ヘッダー：月移動ボタンと年月表示（年月クリックでドロップダウン表示） */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          &lt;
        </button>
        <div>
          
            <input
              type="month"
              value={formatMonth(currentMonth)}
              onChange={(e) => {
                const [year, month] = e.currentTarget.value.split("-");
                setCurrentMonth(new Date(Number(year), Number(month) - 1, 1));
                setIsMonthPickerOpen(false);
              }}
              onBlur={() => setIsMonthPickerOpen(false)}
              autoFocus
              className="text-center px-2 py-1 border border-gray-300 rounded-md"
            />
        </div>
        <button
          onClick={handleNextMonth}
          className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          &gt;
        </button>
      </div>

      {/* カレンダー本体 */}
      <table className="w-full text-center">
        <thead>
          <tr>
            <th className="py-1">日</th>
            <th className="py-1">月</th>
            <th className="py-1">火</th>
            <th className="py-1">水</th>
            <th className="py-1">木</th>
            <th className="py-1">金</th>
            <th className="py-1">土</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((day, di) => {
                if (!day) {
                  return <td key={di} className="py-2"></td>;
                }
                const dateString = formatDate(day);
                const available = isAvailable(day);
                const isSelected = selectedDate === dateString;
                return (
                  <td key={di} className="py-2">
                    <button
                      onClick={() => available && onSelectDate(dateString)}
                      disabled={!available}
                      className={`w-8 h-8 touch-manipulation rounded-full focus:outline-none ${
                        available
                          ? "hover:bg-indigo-100 text-indigo-600"
                          : "text-gray-300 cursor-default"
                      } ${isSelected ? "bg-indigo-600 text-white" : ""}`}
                    >
                      {day.getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 統計情報 */}
      <div className="mt-4 text-sm text-gray-500">
        全{dates.length}日間の履歴
      </div>
    </div>
  );
}
