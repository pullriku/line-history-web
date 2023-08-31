use wasm_bindgen::prelude::*;
use line_history::LineHistory;
use chrono::prelude::*;
use wasm_timer::Instant;

#[wasm_bindgen]
extern {
    pub fn alert(s: &str);
}

#[wasm_bindgen]
pub struct LineHistoryWrapper {
    line_history: LineHistory,
}

#[wasm_bindgen]
impl LineHistoryWrapper {
    #[wasm_bindgen(constructor)]
    pub fn new(data: &str) -> Self {
        let start = Instant::now();
        let result = Self {
            line_history: LineHistory::new(data),
        };
        let end = Instant::now();

        let alert_text = format!("{}s", (end - start).as_secs_f64());
        alert(&alert_text);

        result
    }

    pub fn search_by_date(&self, year: i32, month: u32, day: u32) -> String {
        if let Some(date) = NaiveDate::from_ymd_opt(year, month, day) {
            let result = self.line_history
                .search_by_date(&date)
                .unwrap_or(String::from("該当する日付の履歴はありません。"));

            shape_text_for_html(&result)
        } else {
            String::from("日付の入力が不正です。")
        }
    }

    pub fn search_by_keyword(&self, keyword: &str) -> String {
        let list = self.line_history.search_by_keyword(keyword);
        if list.is_empty() {
            String::from("該当するキーワードの履歴はありません。")
        } else {
            let mut result = String::new();
            for (_i, elem) in list.iter().enumerate() {
                result.push_str(&format!(
                    "{} {}\n",
                    elem.date.format("%Y/%m/%d"),
                    elem.line
                ));
            }

            shape_text_for_html(&result)
        }
    }

    pub fn search_by_random(&self) -> String {
        shape_text_for_html(
            &self.line_history.search_by_random()
        )
    }
}

fn shape_text_for_html(text: &str) -> String {
    text.replace('\n', "<br>")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
}