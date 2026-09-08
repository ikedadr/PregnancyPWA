// =========================================================
// 共通データ
// =========================================================

let currentDueDate = null;

const today = new Date();

let calendarYear = today.getFullYear();
let calendarMonth = today.getMonth();


// =========================================================
// 日付表示
// =========================================================

function formatDate(date) {

    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}/${month}/${day}`;
}


// =========================================================
// 日付に日数を加える
// =========================================================

function addDays(date, days) {

    const result =
        new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );

    result.setDate(
        result.getDate() + days
    );

    return result;
}


// =========================================================
// 日付差
// =========================================================

function differenceInDays(date1, date2) {

    const oneDay =
        24 * 60 * 60 * 1000;

    const utc1 =
        Date.UTC(
            date1.getFullYear(),
            date1.getMonth(),
            date1.getDate()
        );

    const utc2 =
        Date.UTC(
            date2.getFullYear(),
            date2.getMonth(),
            date2.getDate()
        );

    return Math.round(
        (utc1 - utc2) / oneDay
    );
}


// =========================================================
// 妊娠週数
// =========================================================

function gestationalAge(targetDate, dueDate) {

    const pregnancyStart =
        addDays(dueDate, -280);

    const elapsedDays =
        differenceInDays(
            targetDate,
            pregnancyStart
        );

    if (elapsedDays < 0) {

        return {
            weeks: -1,
            days: 0
        };
    }

    return {

        weeks:
            Math.floor(elapsedDays / 7),

        days:
            elapsedDays % 7
    };
}


// =========================================================
// 第○月曜日を求める
// =========================================================

function nthMonday(year, month, n) {

    const first =
        new Date(year, month, 1);

    const firstDay =
        first.getDay();

    let firstMonday =
        1 + ((8 - firstDay) % 7);

    return (
        firstMonday +
        (n - 1) * 7
    );
}


// =========================================================
// 春分の日
// 1980～2099年用
// =========================================================

function vernalEquinoxDay(year) {

    return Math.floor(
        20.8431 +
        0.242194 * (year - 1980) -
        Math.floor((year - 1980) / 4)
    );
}


// =========================================================
// 秋分の日
// 1980～2099年用
// =========================================================

function autumnEquinoxDay(year) {

    return Math.floor(
        23.2488 +
        0.242194 * (year - 1980) -
        Math.floor((year - 1980) / 4)
    );
}


// =========================================================
// 基本となる日本の祝日
//
// 戻り値:
// 祝日 → 祝日名
// 通常日 → null
//
// このアプリでは現行制度を中心に判定
// =========================================================

function basicJapaneseHoliday(date) {

    const year =
        date.getFullYear();

    const month =
        date.getMonth() + 1;

    const day =
        date.getDate();


    // -----------------------------------------------------
    // 1月
    // -----------------------------------------------------

    if (month === 1 && day === 1)
        return "元日";

    if (
        month === 1 &&
        day === nthMonday(year, 0, 2)
    )
        return "成人の日";


    // -----------------------------------------------------
    // 2月
    // -----------------------------------------------------

    if (month === 2 && day === 11)
        return "建国記念の日";

    if (month === 2 && day === 23)
        return "天皇誕生日";


    // -----------------------------------------------------
    // 3月
    // -----------------------------------------------------

    if (
        month === 3 &&
        day === vernalEquinoxDay(year)
    )
        return "春分の日";


    // -----------------------------------------------------
    // 4月
    // -----------------------------------------------------

    if (month === 4 && day === 29)
        return "昭和の日";


    // -----------------------------------------------------
    // 5月
    // -----------------------------------------------------

    if (month === 5 && day === 3)
        return "憲法記念日";

    if (month === 5 && day === 4)
        return "みどりの日";

    if (month === 5 && day === 5)
        return "こどもの日";


    // -----------------------------------------------------
    // 7月
    // -----------------------------------------------------

    if (
        month === 7 &&
        day === nthMonday(year, 6, 3)
    )
        return "海の日";


    // -----------------------------------------------------
    // 8月
    // -----------------------------------------------------

    if (month === 8 && day === 11)
        return "山の日";


    // -----------------------------------------------------
    // 9月
    // -----------------------------------------------------

    if (
        month === 9 &&
        day === nthMonday(year, 8, 3)
    )
        return "敬老の日";

    if (
        month === 9 &&
        day === autumnEquinoxDay(year)
    )
        return "秋分の日";


    // -----------------------------------------------------
    // 10月
    // -----------------------------------------------------

    if (
        month === 10 &&
        day === nthMonday(year, 9, 2)
    )
        return "スポーツの日";


    // -----------------------------------------------------
    // 11月
    // -----------------------------------------------------

    if (month === 11 && day === 3)
        return "文化の日";

    if (month === 11 && day === 23)
        return "勤労感謝の日";


    return null;
}


// =========================================================
// 国民の休日
//
// 前日と翌日が祝日で、当日が祝日でない場合
// =========================================================

function isCitizensHoliday(date) {

    // 日曜日は対象外
    if (date.getDay() === 0)
        return false;


    if (basicJapaneseHoliday(date))
        return false;


    const previousDay =
        addDays(date, -1);

    const nextDay =
        addDays(date, 1);


    return (
        basicJapaneseHoliday(previousDay) !== null &&
        basicJapaneseHoliday(nextDay) !== null
    );
}


// =========================================================
// 振替休日
//
// 祝日が日曜日の場合、その後の最初の非祝日を休日にする
// =========================================================

function isSubstituteHoliday(date) {

    if (basicJapaneseHoliday(date))
        return false;


    let checkDate =
        addDays(date, -1);


    while (
        basicJapaneseHoliday(checkDate) !== null
    ) {

        if (checkDate.getDay() === 0)
            return true;

        checkDate =
            addDays(checkDate, -1);
    }


    return false;
}


// =========================================================
// 日本の祝日判定
// =========================================================

function japaneseHolidayName(date) {

    const basic =
        basicJapaneseHoliday(date);

    if (basic)
        return basic;


    if (isCitizensHoliday(date))
        return "国民の休日";


    if (isSubstituteHoliday(date))
        return "振替休日";


    return null;
}


// =========================================================
// 今日を入力欄へ
// =========================================================

function setToday() {

    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(today.getDate())
            .padStart(2, "0");

    document.getElementById(
        "input-date"
    ).value =
        `${year}-${month}-${day}`;
}


// =========================================================
// 入力方法変更
// =========================================================

function updateMethod() {

    const method =
        document.querySelector(
            'input[name="method"]:checked'
        ).value;

    const dateLabel =
        document.getElementById(
            "date-label"
        );

    const embryoOptions =
        document.getElementById(
            "embryo-options"
        );


    if (method === "lmp") {

        dateLabel.textContent =
            "最終月経開始日";

        embryoOptions.classList.remove(
            "visible"
        );
    }

    else if (method === "ovulation") {

        dateLabel.textContent =
            "排卵日／受精日";

        embryoOptions.classList.remove(
            "visible"
        );
    }

    else if (method === "embryo") {

        dateLabel.textContent =
            "胚移植日";

        embryoOptions.classList.add(
            "visible"
        );
    }

    else if (method === "due") {

        dateLabel.textContent =
            "分娩予定日";

        embryoOptions.classList.remove(
            "visible"
        );
    }
}


// =========================================================
// 予定日計算
// =========================================================

function calculateDueDate() {

    const method =
        document.querySelector(
            'input[name="method"]:checked'
        ).value;

    const dateValue =
        document.getElementById(
            "input-date"
        ).value;


    if (!dateValue) {

        alert(
            "日付を入力してください。"
        );

        return;
    }


    const parts =
        dateValue.split("-");


    const inputDate =
        new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );


    let dueDate;


    // 最終月経
    if (method === "lmp") {

        dueDate =
            addDays(
                inputDate,
                280
            );
    }


    // 排卵日／受精日
    else if (method === "ovulation") {

        dueDate =
            addDays(
                inputDate,
                266
            );
    }


    // 胚移植
    else if (method === "embryo") {

        const embryoDay =
            document.querySelector(
                'input[name="embryo-day"]:checked'
            ).value;


        if (embryoDay === "3") {

            dueDate =
                addDays(
                    inputDate,
                    263
                );
        }

        else {

            dueDate =
                addDays(
                    inputDate,
                    261
                );
        }
    }


    // 分娩予定日を直接入力
    else if (method === "due") {

        dueDate =
            new Date(
                inputDate.getFullYear(),
                inputDate.getMonth(),
                inputDate.getDate()
            );
    }


    currentDueDate =
        dueDate;


    // -----------------------------------------------------
    // 今日の妊娠週数
    // -----------------------------------------------------

    const ga =
        gestationalAge(
            today,
            dueDate
        );


    let gaText;


    if (ga.weeks < 0) {

        gaText =
            "妊娠開始前";
    }

    else {

        gaText =
            `${ga.weeks}週${ga.days}日`;
    }


    // -----------------------------------------------------
    // 結果表示
    // -----------------------------------------------------

    document.getElementById(
        "due-date-result"
    ).textContent =
        formatDate(dueDate);


    document.getElementById(
        "ga-result"
    ).textContent =
        gaText;


    document.getElementById(
        "calendar-due-date"
    ).textContent =
        formatDate(dueDate);


    calendarYear =
        today.getFullYear();

    calendarMonth =
        today.getMonth();


    drawCalendar();
}


// =========================================================
// 同じ日か
// =========================================================

function isSameDate(date1, date2) {

    return (
        date1.getFullYear() ===
            date2.getFullYear()

        &&

        date1.getMonth() ===
            date2.getMonth()

        &&

        date1.getDate() ===
            date2.getDate()
    );
}


// =========================================================
// カレンダー描画
// =========================================================

function drawCalendar() {

    const calendarDays =
        document.getElementById(
            "calendar-days"
        );


    calendarDays.innerHTML =
        "";


    document.getElementById(
        "calendar-month-title"
    ).textContent =
        `${calendarYear}年${calendarMonth + 1}月`;


    const firstDate =
        new Date(
            calendarYear,
            calendarMonth,
            1
        );


    // 月曜日始まりへ変換
    const firstWeekday =
        (firstDate.getDay() + 6) % 7;


    const daysInMonth =
        new Date(
            calendarYear,
            calendarMonth + 1,
            0
        ).getDate();


    // -----------------------------------------------------
    // 月初前の空欄
    // -----------------------------------------------------

    for (
        let i = 0;
        i < firstWeekday;
        i++
    ) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "calendar-empty";

        calendarDays.appendChild(
            empty
        );
    }


    // -----------------------------------------------------
    // 各日
    // -----------------------------------------------------

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const thisDate =
            new Date(
                calendarYear,
                calendarMonth,
                day
            );


        const holidayName =
            japaneseHolidayName(
                thisDate
            );


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";

        button.className =
            "calendar-day";


        // -------------------------------------------------
        // 土曜日
        // -------------------------------------------------

        if (thisDate.getDay() === 6) {

            button.classList.add(
                "saturday"
            );
        }


        // -------------------------------------------------
        // 日曜日
        // -------------------------------------------------

        if (thisDate.getDay() === 0) {

            button.classList.add(
                "sunday"
            );
        }


        // -------------------------------------------------
        // 祝日
        // -------------------------------------------------

        if (holidayName !== null) {

            button.classList.add(
                "holiday"
            );

            button.title =
                holidayName;
        }


        // -------------------------------------------------
        // 今日
        // -------------------------------------------------

        if (
            isSameDate(
                thisDate,
                today
            )
        ) {

            button.classList.add(
                "today"
            );
        }


        // -------------------------------------------------
        // 分娩予定日
        // -------------------------------------------------

        if (
            currentDueDate !== null &&
            isSameDate(
                thisDate,
                currentDueDate
            )
        ) {

            button.classList.add(
                "due-date"
            );
        }


        // -------------------------------------------------
        // 日付
        // -------------------------------------------------

        const dayNumber =
            document.createElement(
                "div"
            );

        dayNumber.className =
            "day-number";

        dayNumber.textContent =
            day;

        button.appendChild(
            dayNumber
        );


        // -------------------------------------------------
        // 妊娠週数
        // -------------------------------------------------

        if (currentDueDate !== null) {

            const ga =
                gestationalAge(
                    thisDate,
                    currentDueDate
                );


            if (
                ga.weeks >= 0 &&
                ga.weeks <= 42
            ) {

                const gaElement =
                    document.createElement(
                        "div"
                    );

                gaElement.className =
                    "day-ga";

                gaElement.textContent =
                    `${ga.weeks}週${ga.days}日`;

                button.appendChild(
                    gaElement
                );
            }
        }


        // -------------------------------------------------
        // タップ
        // -------------------------------------------------

        button.addEventListener(
            "click",
            function () {

                selectCalendarDate(
                    thisDate
                );
            }
        );


        calendarDays.appendChild(
            button
        );
    }
}


// =========================================================
// カレンダーの日をタップ
// =========================================================

function selectCalendarDate(selectedDate) {

    const holidayName =
        japaneseHolidayName(
            selectedDate
        );


    let dateText =
        formatDate(
            selectedDate
        );


    if (holidayName) {

        dateText +=
            `　${holidayName}`;
    }


    document.getElementById(
        "selected-date"
    ).textContent =
        dateText;


    const selectedGa =
        document.getElementById(
            "selected-ga"
        );


    if (currentDueDate === null) {

        selectedGa.textContent =
            "予定日が設定されていません";

        return;
    }


    const ga =
        gestationalAge(
            selectedDate,
            currentDueDate
        );


    if (ga.weeks < 0) {

        selectedGa.textContent =
            "妊娠開始前";
    }

    else {

        selectedGa.textContent =
            `${ga.weeks}週${ga.days}日`;
    }
}


// =========================================================
// 前月
// =========================================================

function previousMonth() {

    calendarMonth--;

    if (calendarMonth < 0) {

        calendarMonth = 11;
        calendarYear--;
    }

    drawCalendar();
}


// =========================================================
// 翌月
// =========================================================

function nextMonth() {

    calendarMonth++;

    if (calendarMonth > 11) {

        calendarMonth = 0;
        calendarYear++;
    }

    drawCalendar();
}


// =========================================================
// 今月
// =========================================================

function goToday() {

    calendarYear =
        today.getFullYear();

    calendarMonth =
        today.getMonth();

    drawCalendar();
}


// =========================================================
// タブ
// =========================================================

function setupTabs() {

    const buttons =
        document.querySelectorAll(
            ".tab-button"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                document
                    .querySelectorAll(
                        ".tab-button"
                    )
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );
                    });


                document
                    .querySelectorAll(
                        ".tab-content"
                    )
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );
                    });


                button.classList.add(
                    "active"
                );


                const tabId =
                    button.dataset.tab;


                document
                    .getElementById(
                        tabId
                    )
                    .classList.add(
                        "active"
                    );


                if (tabId === "calendar") {

                    drawCalendar();
                }
            }
        );
    });
}


// =========================================================
// 起動
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setToday();

        updateMethod();

        setupTabs();

        drawCalendar();


        document
            .querySelectorAll(
                'input[name="method"]'
            )
            .forEach(radio => {

                radio.addEventListener(
                    "change",
                    updateMethod
                );
            });


document
    .getElementById(
        "input-date"
    )
    .addEventListener(
        "change",
        calculateDueDate
    );


        document
            .getElementById(
                "previous-month"
            )
            .addEventListener(
                "click",
                previousMonth
            );


        document
            .getElementById(
                "next-month"
            )
            .addEventListener(
                "click",
                nextMonth
            );


        document
            .getElementById(
                "today-button"
            )
            .addEventListener(
                "click",
                goToday
            );
    }
);