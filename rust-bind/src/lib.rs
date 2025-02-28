use std::convert::TryInto;

use chrono::{Datelike, NaiveDate, NaiveTime, Timelike};
use line_history::{
    history::{OwnedDay, OwnedHistory},
    traits::{HistoryData, SearchByDate, SearchByKeyword, SearchByRandom},
};
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, rust-bind!");
}

#[wasm_bindgen]
pub struct Time {
    pub hour: u8,
    pub minute: u8,
}

#[wasm_bindgen]
impl Time {
    #[wasm_bindgen(constructor)]
    pub fn new(hour: u8, minute: u8) -> Time {
        Time { hour, minute }
    }
}

impl From<NaiveTime> for Time {
    fn from(time: NaiveTime) -> Self {
        Time {
            hour: time.hour() as u8,
            minute: time.minute() as u8,
        }
    }
}

impl TryInto<NaiveTime> for Time {
    type Error = ();
    fn try_into(self) -> Result<NaiveTime, Self::Error> {
        NaiveTime::from_hms_opt(self.hour as u32, self.minute as u32, 0).ok_or(())
    }
}

#[wasm_bindgen]
#[derive(Clone, Copy, Debug)]
pub struct Date {
    pub year: u16,
    pub month0: u8,
    pub day0: u8,
}

#[wasm_bindgen]
impl Date {
    #[wasm_bindgen(constructor)]
    pub fn new(year: u16, month0: u8, day0: u8) -> Date {
        Date { year, month0, day0 }
    }
}

impl TryInto<NaiveDate> for Date {
    type Error = ();
    fn try_into(self) -> Result<NaiveDate, Self::Error> {
        NaiveDate::from_ymd_opt(
            self.year as i32,
            self.month0 as u32 + 1,
            self.day0 as u32 + 1,
        ).ok_or(())
    }
}

impl From<NaiveDate> for Date {
    fn from(date: NaiveDate) -> Self {
        Date {
            year: date.year() as u16,
            month0: date.month0() as u8,
            day0: date.day0() as u8,
        }
    }
}


#[wasm_bindgen]
pub struct History {
    inner: OwnedHistory,
}

#[wasm_bindgen]
impl History {
    pub fn from_text(text: &str) -> Option<Self> {
        let inner: OwnedHistory = ::line_history::history::History::from_text(text).into();

        if inner.is_empty() {
            None
        } else {
            Some(History { inner })
        }
    }

    pub fn days(&self) -> Vec<Day> {
        self.inner
            .days()
            .values()
            .map(|d| d.clone().into())
            .collect()
    }

    pub fn available_dates(&self) -> Vec<Date> {
        self.inner.days.keys().map(|d| (*d).into()).collect()
    }

    pub fn search_by_date(&self, date: Date) -> Option<Day> {
        self.inner.search_by_date(&date.try_into().ok()?).map(|d| d.clone().into())
    }

    pub fn search_by_keyword(&self, keyword: &str) -> Vec<TimedChat> {
        self.inner
            .search_by_keyword(keyword)
            .map(|(date, owned_chat)| TimedChat {
                date: date.into(),
                chat: owned_chat.clone().into(),
            })
            .collect()
    }

    pub fn search_by_random(&self) -> Day {
        self.inner.search_by_random().clone().into()
    }
}

#[wasm_bindgen]
pub struct TimedChat {
    date: Date,
    chat: Chat,
}

impl TimedChat {
    pub fn date(&self) -> Date {
        self.date
    }

    pub fn chats(&self) -> Chat {
        self.chat.clone()
    }
}

#[wasm_bindgen]
#[derive(Debug)]
pub struct Day {
    inner: OwnedDay,
}

impl From<OwnedDay> for Day {
    fn from(value: OwnedDay) -> Self {
        Day { inner: value }
    }
}

#[wasm_bindgen]
impl Day {
    pub fn date(&self) -> Date {
        self.inner.date.into()
    }

    pub fn chats(&self) -> Vec<Chat> {
        self.inner.chats.iter().map(|c| c.clone().into()).collect()
    }
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct Chat {
    inner: ::line_history::history::OwnedChat,
}

impl From<::line_history::history::OwnedChat> for Chat {
    fn from(value: ::line_history::history::OwnedChat) -> Self {
        Chat { inner: value }
    }
}

#[wasm_bindgen]
impl Chat {
    pub fn time(&self) -> Time {
        self.inner.time.into()
    }

    pub fn speaker(&self) -> Option<String> {
        self.inner.speaker.clone()
    }

    pub fn message_lines(&self) -> Vec<String> {
        self.inner.message_lines.clone()
    }

    pub fn content(&self) -> String {
        self.inner.message_lines.join("\n")
    }
}
