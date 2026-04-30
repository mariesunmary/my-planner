import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { getWeekDates, generateMonthDays } from "../utils/date";
import common from "../styles/Common.module.css";
import styles from "./StatisticsPage.module.css";
import api from "../services/api";

const PALETTE = { primary: "#3a7bd5", secondary: "#8cc0f7", success: "#7ee8a2", warning: "#ffd166", muted: "#cbd5e1" };
const EXPENSE_CATEGORIES = ["Food", "Transport", "Entertainment", "Health", "Shopping", "Other"];
const CATEGORY_COLORS    = ["#3a7bd5", "#8cc0f7", "#7ee8a2", "#ffd166", "#ef476f", "#a78bfa"];

/**
 *
 */
function StatisticsPage() {
  const today = new Date();
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [tracking, setTracking] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [projectTasks, setProjectTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/tasks"),
      api.get("/habits"),
      api.get("/habits/tracking"),
      api.get("/expenses"),
      api.get("/projects"),
    ]).then(([tasksRes, habitsRes, trackRes, expensesRes, projectsRes]) => {
      setWeeklyTasks(tasksRes.data);
      setHabits(habitsRes.data);
      setTracking(trackRes.data);
      setExpenses(expensesRes.data);
      setProjectTasks(projectsRes.data.tasks);
    }).finally(() => setLoading(false));
  }, []);

  // Weekly tasks
  const weekDates = getWeekDates();
  const weekData = weekDates.map(({ label, fullDate }) => {
    const dayTasks = weeklyTasks.filter((t) => t.week_key === fullDate);
    const done = dayTasks.filter((t) => t.done).length;
    return { day: label, done, pending: dayTasks.length - done };
  });
  const totalTasksDone = weekData.reduce((s, d) => s + d.done, 0);
  const totalTasksAll  = weekData.reduce((s, d) => s + d.done + d.pending, 0);

  // Habits
  const days = generateMonthDays(today.getFullYear(), today.getMonth());
  const currentMonthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const habitData = habits.map((habit) => {
    const completed = tracking.filter(
      (r) => r.habit_id === habit.id && r.date.startsWith(currentMonthPrefix)
    ).length;
    const pct = days.length > 0 ? Math.round((completed / days.length) * 100) : 0;
    return { name: habit.name.length > 20 ? habit.name.slice(0, 20) + "…" : habit.name, pct };
  });
  const avgHabit = habitData.length
    ? Math.round(habitData.reduce((s, h) => s + h.pct, 0) / habitData.length)
    : 0;

  // Budget
  const monthExpenses = expenses.filter((e) => e.date?.startsWith(currentMonthPrefix));
  const totalSpending = monthExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const budgetData = EXPENSE_CATEGORIES.map((cat, i) => ({
    name: cat,
    amount: monthExpenses.filter((e) => e.category === cat).reduce((s, e) => s + Number(e.amount || 0), 0),
    color: CATEGORY_COLORS[i],
  })).filter((d) => d.amount > 0);

  // Projects
  let tasksTodo = 0, tasksInProgress = 0, tasksDone = 0;
  projectTasks.forEach((t) => {
    if (t.status === "To Do") {tasksTodo++;}
    else if (t.status === "In Progress") {tasksInProgress++;}
    else if (t.status === "Done") {tasksDone++;}
  });
  const totalProjectTasks = tasksTodo + tasksInProgress + tasksDone;
  const projectPieData = [
    { name: "To Do",       value: tasksTodo,       color: PALETTE.muted    },
    { name: "In Progress", value: tasksInProgress, color: PALETTE.warning  },
    { name: "Done",        value: tasksDone,       color: PALETTE.success  },
  ].filter((d) => d.value > 0);

  if (loading) {return <div className={common.container}><p>Loading...</p></div>;}

  return (
    <div className={`${common.container} ${common.pageEnter}`}>
      <p className={common.intro}>
        Every number here tells a story about your consistency and growth. 📊&nbsp;
        Use these insights to celebrate what's working and discover where to focus next.
        Progress — no matter how small — is always worth seeing.
      </p>

      <div className={styles.cards}>
        <div className={styles.card}>
          <span className={styles.cardIcon}>✅</span>
          <div>
            <p className={styles.cardValue}>{totalTasksDone}<span className={styles.cardTotal}>/{totalTasksAll}</span></p>
            <p className={styles.cardLabel}>Tasks done this week</p>
          </div>
        </div>
        <div className={styles.card}>
          <span className={styles.cardIcon}>🌱</span>
          <div>
            <p className={styles.cardValue}>{avgHabit}<span className={styles.cardTotal}>%</span></p>
            <p className={styles.cardLabel}>Avg. habit completion</p>
          </div>
        </div>
        <div className={styles.card}>
          <span className={styles.cardIcon}>💸</span>
          <div>
            <p className={styles.cardValue}>${totalSpending.toFixed(0)}</p>
            <p className={styles.cardLabel}>Spent this month</p>
          </div>
        </div>
        <div className={styles.card}>
          <span className={styles.cardIcon}>🎯</span>
          <div>
            <p className={styles.cardValue}>{tasksDone}<span className={styles.cardTotal}>/{totalProjectTasks}</span></p>
            <p className={styles.cardLabel}>Project tasks done</p>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.chartBox}>
          <h3 className={styles.chartTitle}>Weekly To-Do</h3>
          <p className={styles.chartSub}>Tasks completed vs pending this week</p>
          {totalTasksAll === 0 ? <p className={styles.empty}>No tasks added yet this week.</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip /><Legend />
                <Bar dataKey="done" name="Done" fill={PALETTE.primary} radius={[4,4,0,0]} />
                <Bar dataKey="pending" name="Pending" fill={PALETTE.muted} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className={styles.chartBox}>
          <h3 className={styles.chartTitle}>Habit Tracker</h3>
          <p className={styles.chartSub}>Completion % per habit this month</p>
          {habitData.length === 0 ? <p className={styles.empty}>No habits tracked this month.</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={habitData} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="pct" name="Completion" fill={PALETTE.secondary} radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className={styles.chartBox}>
          <h3 className={styles.chartTitle}>Monthly Budget</h3>
          <p className={styles.chartSub}>Spending by category this month</p>
          {budgetData.length === 0 ? <p className={styles.empty}>No expenses recorded this month.</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={budgetData} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
                <Bar dataKey="amount" name="Amount" radius={[4,4,0,0]}>
                  {budgetData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className={styles.chartBox}>
          <h3 className={styles.chartTitle}>Project Planner</h3>
          <p className={styles.chartSub}>Task status across all projects</p>
          {totalProjectTasks === 0 ? <p className={styles.empty}>No project tasks added yet.</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={projectPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {projectPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatisticsPage;
