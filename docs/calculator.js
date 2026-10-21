"use strict";
function weightedAverage(courses) {
  if (!courses.length) throw new Error("Hãy thêm ít nhất một môn.");
  let total = 0, credits = 0;
  for (const course of courses) {
    if (!Number.isFinite(course.grade) || course.grade < 0 || course.grade > 10 || !Number.isFinite(course.credits) || course.credits <= 0) throw new Error("Điểm phải từ 0 đến 10; tín chỉ phải lớn hơn 0.");
    total += course.grade * course.credits;
    credits += course.credits;
  }
  if (!Number.isFinite(total) || !Number.isFinite(credits) || !Number.isFinite(total / credits)) throw new Error("Giá trị quá lớn, hãy kiểm tra lại.");
  return { average: total / credits, credits };
}
const form = document.getElementById("calculator");
const rows = document.getElementById("rows");
const output = document.getElementById("calc-result");
let courseNumber = 3;
function calculate() {
  try {
    const courses = [...rows.querySelectorAll(".calc-row")].map(row => ({grade: row.querySelector('[name="grade"]').valueAsNumber, credits: row.querySelector('[name="credits"]').valueAsNumber}));
    const result = weightedAverage(courses);
    output.textContent = result.average.toLocaleString("vi-VN", {minimumFractionDigits: 2, maximumFractionDigits: 2}) + " / 10 · " + result.credits.toLocaleString("vi-VN") + " tín chỉ";
  } catch (error) { output.textContent = error.message; }
}
form.addEventListener("submit", event => { event.preventDefault(); calculate(); });
form.addEventListener("input", calculate);
rows.addEventListener("click", event => {
  const button = event.target.closest(".remove");
  if (!button) return;
  const next = button.closest(".calc-row").nextElementSibling;
  button.closest(".calc-row").remove();
  if (next) next.querySelector("input").focus(); else document.getElementById("add-course").focus();
  calculate();
});
document.getElementById("add-course").addEventListener("click", () => {
  courseNumber++;
  const row = document.createElement("div");
  row.className = "calc-row";
  for (const [name, text, min, max] of [["grade", "Điểm môn", "0", "10"], ["credits", "Tín chỉ môn", "0.01", null]]) {
    const label = document.createElement("label");
    label.textContent = text + " " + courseNumber;
    const input = document.createElement("input");
    input.name = name; input.type = "number"; input.min = min; input.step = "any"; input.required = true;
    if (max) input.max = max;
    label.append(input); row.append(label);
  }
  const button = document.createElement("button"); button.type = "button"; button.className = "remove"; button.textContent = "Xóa"; button.setAttribute("aria-label", "Xóa môn " + courseNumber); row.append(button); rows.append(row); row.querySelector("input").focus(); calculate();
});
