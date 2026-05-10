const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EXPENSE_CATEGORIES = ["Food", "Transport", "Housing", "Health", "Entertainment", "Shopping", "Other"];
const VALID_STATUSES = ["To Do", "In Progress", "Done"];
const VALID_THEMES = ["light", "dark"];
const VALID_CURRENCIES = ["USD", "EUR", "UAH"];

function validate(res, checks) {
  for (const [condition, message] of checks) {
    if (condition) {
      res.status(400).json({ error: message });
      return false;
    }
  }
  return true;
}

function isValidDate(str) {
  if (!str) return false;
  const d = new Date(str);
  return !isNaN(d.getTime());
}

function isValidWeekKey(str) {
  return /^\d{4}-W\d{2}$/.test(str);
}

module.exports = { validate, EMAIL_RE, EXPENSE_CATEGORIES, VALID_STATUSES, VALID_THEMES, VALID_CURRENCIES, isValidDate, isValidWeekKey };
