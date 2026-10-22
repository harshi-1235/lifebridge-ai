const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const STORAGE_KEY = "lifebridge-ai-starter-v1";

const stageDetails = {
  school: { label: "School student", greeting: "Make learning feel manageable.", areas: ["Learning", "Wellbeing", "Family & care"], description: "Small, steady steps can make school and everyday life feel more manageable." },
  college: { label: "College student", greeting: "Build your next chapter, one step at a time.", areas: ["Learning", "Career", "Money"], description: "Keep your studies, opportunities, and personal goals moving together." },
  career: { label: "Employee / job seeker", greeting: "Make room for your next opportunity.", areas: ["Career", "Money", "Wellbeing"], description: "Bring your work goals, everyday responsibilities, and wellbeing into one view." },
  family: { label: "Parent / caregiver", greeting: "A little more clarity for a busy life.", areas: ["Family & care", "Money", "Everyday life"], description: "Coordinate responsibilities and protect time for the people and things that matter." },
  senior: { label: "Older adult", greeting: "Your essentials, in one clear place.", areas: ["Wellbeing", "Everyday life", "Family & care"], description: "Keep reminders and useful resources easy to find, at your own pace." },
  other: { label: "Personal profile", greeting: "Make your space work for you.", areas: ["Everyday life", "Wellbeing", "Learning"], description: "Choose the life areas and next steps that matter most to you." }
};

const sampleResources = [
  { title: "Study plan builder", category: "Learning", icon: "✎", description: "Break a large study goal into small, achievable sessions.", source: "LifeBridge sample tool", url: "#", note: "Example resource" },
  { title: "Career readiness checklist", category: "Career", icon: "↗", description: "Organize your resume, skills, portfolio, and application tasks.", source: "LifeBridge sample tool", url: "#", note: "Example resource" },
  { title: "Simple monthly budget", category: "Money", icon: "₹", description: "List income, regular costs, and savings goals in one place.", source: "LifeBridge sample tool", url: "#", note: "Example resource" },
  { title: "Family schedule checklist", category: "Family & care", icon: "⌂", description: "Keep shared responsibilities and important dates organized.", source: "LifeBridge sample tool", url: "#", note: "Example resource" },
  { title: "Wellbeing routine planner", category: "Wellbeing", icon: "♡", description: "Plan breaks, movement, sleep routines, and personal check-ins.", source: "LifeBridge sample tool", url: "#", note: "Not medical advice" },
  { title: "Important document tracker", category: "Everyday life", icon: "▤", description: "Track renewals and expiry dates for documents you choose to record.", source: "LifeBridge sample tool", url: "#", note: "Keep sensitive files off this demo" },
  { title: "Scholarship search starting points", category: "Learning", icon: "☆", description: "Make a shortlist of scholarships and verify eligibility and deadlines on official sites.", source: "Official-source checklist", url: "https://scholarships.gov.in/", note: "Verify current details" },
  { title: "National Career Service", category: "Career", icon: "⌘", description: "Explore India's government career and employment services.", source: "Government of India", url: "https://www.ncs.gov.in/", note: "Official resource" },
  { title: "UMANG public services", category: "Everyday life", icon: "◈", description: "Find eligible government services and information through UMANG.", source: "Government of India", url: "https://web.umang.gov.in/", note: "Check official details" }
];

const defaultState = {
  profile: { name: "Alex Morgan", stage: "college", goals: "Finish my semester and explore career options", interests: ["Learning", "Career", "Money"], location: "", accessibility: "standard" },
  tasks: [
    { id: "t1", title: "Create a study plan for the next exam", area: "Learning", due: dateOffset(2), priority: "high", done: false, source: "sample" },
    { id: "t2", title: "Update my resume draft", area: "Career", due: dateOffset(4), priority: "medium", done: false, source: "sample" },
    { id: "t3", title: "Review this month's spending", area: "Money", due: dateOffset(5), priority: "low", done: false, source: "sample" },
    { id: "t4", title: "Take a proper screen break", area: "Wellbeing", due: dateOffset(1), priority: "low", done: false, source: "sample" },
    { id: "t5", title: "Collect notes for project work", area: "Learning", due: dateOffset(-1), priority: "medium", done: true, source: "sample" },
    { id: "t6", title: "Set one goal for this week", area: "Everyday life", due: dateOffset(-2), priority: "low", done: true, source: "sample" }
  ],
  privacy: { personalization: true, localStorage: true, reminders: false, analytics: false },
  onboardingDone: false
};

function dateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...clone(defaultState), ...parsed, profile: { ...clone(defaultState.profile), ...(parsed.profile || {}) }, privacy: { ...clone(defaultState.privacy), ...(parsed.privacy || {}) }, tasks: Array.isArray(parsed.tasks) ? parsed.tasks : clone(defaultState.tasks) };
    }
  } catch (error) { console.warn("Could not read saved demo state.", error); }
  return clone(defaultState);
}
let state = loadState();
let activeView = "overview";
let toastTimer;

function saveState() {
  if (!state.privacy.localStorage) return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (error) { showToast("Browser storage is unavailable. Changes may not persist."); }
}
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}
function displayDate(value) {
  if (!value) return "No date";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "No date";
  const today = dateOffset(0), tomorrow = dateOffset(1);
  if (value === today) return "Today";
  if (value === tomorrow) return "Tomorrow";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function dateParts(value) {
  if (!value) return { month: "—", day: "–" };
  const date = new Date(`${value}T12:00:00`);
  return { month: date.toLocaleDateString(undefined, { month: "short" }), day: date.getDate() };
}
function sortTasks(tasks) {
  const order = { high: 0, medium: 1, low: 2 };
  return [...tasks].sort((a, b) => Number(a.done) - Number(b.done) || (a.due || "9999").localeCompare(b.due || "9999") || order[a.priority] - order[b.priority]);
}
function openTasks() { return state.tasks.filter(task => !task.done); }
function radarTasks() {
  const tasks = sortTasks(openTasks());
  if (!state.privacy.personalization) return tasks;
  const interests = state.profile.interests || [];
  return tasks.sort((a, b) => {
    const score = task => (interests.includes(task.area) ? 2 : 0) + (task.priority === "high" ? 3 : task.priority === "medium" ? 1 : 0) + (task.due && task.due <= dateOffset(2) ? 2 : 0);
    return score(b) - score(a);
  });
}
function activeStage() { return stageDetails[state.profile.stage] || stageDetails.other; }
function initials(name) { return (name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("") || "U").toUpperCase(); }
function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2700);
}
function navigate(view) {
  activeView = view;
  $$(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.view === view));
  $("#breadcrumbLabel").textContent = ({ overview: "Overview", radar: "Life Radar", tasks: "My tasks", resources: "Resources", profile: "My profile", privacy: "Privacy & safety" })[view] || "Overview";
  $("#sidebar").classList.remove("open");
  renderView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function renderOverview() {
  const profile = state.profile;
  const stage = activeStage();
  $("#greetingName").textContent = profile.name.trim().split(/\s+/)[0] || "there";
  $("#welcomeCopy").textContent = stage.greeting;
  $("#heroDescription").textContent = state.privacy.personalization ? stage.description : "Your next steps, in one calm place. Personal recommendations are currently paused.";
  $("#sidebarName").textContent = profile.name || "Your profile";
  $("#sidebarStage").textContent = stage.label;
  $("#avatarInitials").textContent = initials(profile.name);
  $("#topAvatar").textContent = initials(profile.name);
  $("#todayLabel").textContent = new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  $("#statOpen").textContent = String(openTasks().length).padStart(2, "0");
  $("#statDone").textContent = String(state.tasks.filter(task => task.done).length).padStart(2, "0");
  $("#statAreas").textContent = String((profile.interests || []).length).padStart(2, "0");
  $("#radarCount").textContent = openTasks().length;
  const tasks = radarTasks();
  $("#radarPreview").innerHTML = tasks.length ? tasks.slice(0, 4).map(task => `
    <div class="action-row">
      <button class="action-check ${task.done ? "done" : ""}" data-toggle-task="${escapeHTML(task.id)}" aria-label="Mark ${escapeHTML(task.title)} complete">${task.done ? "✓" : ""}</button>
      <div class="action-main"><strong>${escapeHTML(task.title)}</strong><small>${escapeHTML(task.area)} · ${escapeHTML(displayDate(task.due))}</small></div>
      <div class="action-meta"><span class="priority ${escapeHTML(task.priority)}">${escapeHTML(task.priority[0].toUpperCase() + task.priority.slice(1))}</span></div>
    </div>`).join("") : `<div class="empty-state">You're all caught up. Add a task whenever you're ready.</div>`;
  const areas = profile.interests || [];
  const areaIcons = { "Learning": "✎", "Career": "↗", "Money": "₹", "Family & care": "⌂", "Wellbeing": "♡", "Everyday life": "◈" };
  $("#areaList").innerHTML = areas.length ? areas.map((area, index) => {
    const count = openTasks().filter(task => task.area === area).length;
    const percent = Math.min(100, 25 + count * 24);
    return `<div class="area-row"><div class="area-icon">${areaIcons[area] || "✦"}</div><div class="area-text"><strong>${escapeHTML(area)}</strong><small>${count} open ${count === 1 ? "action" : "actions"}</small></div><div class="area-bar"><span style="width:${percent}%"></span></div></div>`;
  }).join("") : `<div class="empty-state">Choose life areas in your profile to personalize this space.</div>`;
  const upcoming = sortTasks(openTasks()).filter(task => task.due).slice(0, 3);
  $("#upcomingList").innerHTML = upcoming.length ? upcoming.map(task => {
    const date = dateParts(task.due);
    return `<div class="timeline-item"><div class="date-chip"><small>${escapeHTML(date.month)}</small><strong>${date.day}</strong></div><div><strong>${escapeHTML(task.title)}</strong><p>${escapeHTML(task.area)} · ${escapeHTML(displayDate(task.due))}</p></div></div>`;
  }).join("") : `<div class="empty-state">No upcoming tasks. You're free to add one.</div>`;
}
function viewHeader(eyebrow, title, description, action = "") {
  return `<div class="view-heading"><p class="eyebrow">${escapeHTML(eyebrow)}</p><h1>${escapeHTML(title)}</h1><p>${escapeHTML(description)}</p></div>${action}`;
}
function renderRadar() {
  const tasks = radarTasks();
  $("#mainContent").innerHTML = `${viewHeader("YOUR PERSONAL NEXT-ACTION ENGINE", "Your Life Radar", "A practical shortlist of next steps. Recommendations use your chosen interests, task priority, and due dates.")}<div class="notice">Life Radar uses simple transparent demo rules—not a predictive AI model. Review each suggestion and change priorities to fit your needs.</div><section class="panel"><div class="panel-heading"><div><p class="eyebrow">YOUR NEXT STEPS</p><h3>${tasks.length} open ${tasks.length === 1 ? "action" : "actions"}</h3></div><button class="primary-btn" id="addTaskView">＋ Add a task</button></div><div class="action-list">${tasks.length ? tasks.map(task => `<div class="action-row"><button class="action-check" data-toggle-task="${escapeHTML(task.id)}" aria-label="Complete task">✓</button><div class="action-main"><strong>${escapeHTML(task.title)}</strong><small>${escapeHTML(task.area)} · Due ${escapeHTML(displayDate(task.due))}</small></div><div class="action-meta"><span class="priority ${escapeHTML(task.priority)}">${escapeHTML(task.priority)}</span></div></div>`).join("") : `<div class="empty-state">Your radar is clear. Add a task to get started.</div>`}</div></section>`;
}
function renderTasks() {
  const tasks = sortTasks(state.tasks);
  $("#mainContent").innerHTML = `${viewHeader("YOUR PERSONAL CHECKLIST", "My tasks", "Capture responsibilities, set a date, and mark progress as you go.", '<div class="view-toolbar"><select class="filter-select" id="taskFilter" aria-label="Filter tasks"><option value="all">All tasks</option><option value="open">Open tasks</option><option value="done">Completed tasks</option></select><button class="primary-btn" id="addTaskView">＋ Add a task</button></div>')}<section class="panel"><div class="task-table" id="taskTable">${tasks.map(task => `<div class="task-table-row" data-task-row="${escapeHTML(task.id)}"><div><strong>${escapeHTML(task.title)}</strong><small>${escapeHTML(task.area)} · ${escapeHTML(task.priority)} priority</small></div><span class="task-date"><small>${escapeHTML(displayDate(task.due))}</small></span><span class="status-tag ${task.done ? "" : "open"}">${task.done ? "Completed" : "Open"}</span><button class="delete-btn" data-delete-task="${escapeHTML(task.id)}" title="Delete task" aria-label="Delete ${escapeHTML(task.title)}">×</button></div>`).join("") || '<div class="empty-state">No tasks yet. Add your first task.</div>'}</div></section>`;
}
function renderResources() {
  $("#mainContent").innerHTML = `${viewHeader("A FEW USEFUL STARTING POINTS", "Resources", "Explore sample tools and links. Verify eligibility, availability, and current details with the official provider.")}<div class="view-toolbar"><select class="filter-select" id="resourceFilter" aria-label="Filter resources"><option value="all">All life areas</option>${[...new Set(sampleResources.map(item => item.category))].map(category => `<option>${escapeHTML(category)}</option>`).join("")}</select><span class="muted">Sample directory · not an exhaustive list</span></div><div class="resource-grid" id="resourceGrid">${sampleResources.map(resource => `<article class="resource-card" data-category="${escapeHTML(resource.category)}"><div class="resource-icon">${escapeHTML(resource.icon)}</div><small>${escapeHTML(resource.category)} · ${escapeHTML(resource.source)}</small><h3>${escapeHTML(resource.title)}</h3><p>${escapeHTML(resource.description)}</p><small>${escapeHTML(resource.note)}</small>${resource.url !== "#" ? `<a href="${escapeHTML(resource.url)}" target="_blank" rel="noopener noreferrer">Visit official resource ↗</a>` : `<a href="#" data-resource-demo="${escapeHTML(resource.title)}">Explore sample tool →</a>`}</article>`).join("")}</div>`;
}
function renderProfile() {
  const p = state.profile;
  const interests = ["Learning", "Career", "Money", "Family & care", "Wellbeing", "Everyday life"];
  $("#mainContent").innerHTML = `${viewHeader("YOUR SPACE, YOUR CHOICES", "My profile", "Tell LifeBridge what matters to you. You can change or clear these details at any time.")}<div class="profile-layout"><section class="panel form-panel"><h3>About you</h3><form class="form-stack" id="profileForm"><label>Display name<input name="name" maxlength="70" value="${escapeHTML(p.name)}" required /></label><label>Life stage<select name="stage">${Object.entries(stageDetails).map(([key, item]) => `<option value="${key}" ${p.stage === key ? "selected" : ""}>${escapeHTML(item.label)}</option>`).join("")}</select></label><label>Goals for this season<textarea name="goals" rows="3" maxlength="500" placeholder="What would you like help with?">${escapeHTML(p.goals)}</textarea></label><label>Location (optional)<input name="location" maxlength="100" value="${escapeHTML(p.location || "")}" placeholder="City or region only, if needed" /></label><label>Accessibility preference<select name="accessibility"><option value="standard" ${p.accessibility === "standard" ? "selected" : ""}>Standard</option><option value="large" ${p.accessibility === "large" ? "selected" : ""}>Larger text</option><option value="simple" ${p.accessibility === "simple" ? "selected" : ""}>Simplified interface</option></select></label><div><strong style="font-size:11px">Life areas to focus on</strong><p class="muted" style="margin:6px 0 10px">Choose the areas you want to see first.</p>${interests.map(area => `<label class="check-row"><input type="checkbox" name="interests" value="${escapeHTML(area)}" ${(p.interests || []).includes(area) ? "checked" : ""}/> ${escapeHTML(area)}</label>`).join("")}</div><button class="primary-btn" type="submit">Save my profile</button></form></section><section class="panel form-panel"><h3>Your dashboard adapts</h3><div class="notice">Age is not required for this prototype. Life stage and your selected interests guide the sample dashboard; they do not determine service eligibility.</div><div class="area-list">${(p.interests || []).map(area => `<div class="area-row"><div class="area-icon">✦</div><div class="area-text"><strong>${escapeHTML(area)}</strong><small>${state.tasks.filter(task => task.area === area && !task.done).length} open actions</small></div></div>`).join("") || '<div class="empty-state">No focus areas selected.</div>'}</div><button class="outline-btn full-btn" id="resetProfile">Reset profile to demo</button></section></div>`;
}
function renderPrivacy() {
  const options = [
    ["personalization", "Personalized suggestions", "Use selected interests, due dates, and priorities to sort Life Radar."],
    ["localStorage", "Save on this device", "Keep your profile and tasks in this browser's local storage. Turning this off stops future saves; use Clear local data to erase existing data."],
    ["reminders", "Reminder preference", "Demo preference only. This starter does not send notifications."],
    ["analytics", "Optional analytics", "Demo preference only. No analytics service is connected."]
  ];
  $("#mainContent").innerHTML = `${viewHeader("YOUR DATA, YOUR DECISIONS", "Privacy & safety", "This starter stores demo information locally in your browser. It does not provide real accounts, cloud sync, or production-grade security.")}<div class="notice"><strong>Prototype safety note:</strong> Do not enter passwords, government ID numbers, medical details, bank credentials, or other sensitive information. This is a frontend demo, not a secure production service.</div><section class="panel"><div class="panel-heading"><div><p class="eyebrow">YOUR PREFERENCES</p><h3>Control your experience</h3></div></div>${options.map(([key, title, description]) => `<div class="privacy-option"><div><strong>${escapeHTML(title)}</strong><p>${escapeHTML(description)}</p></div><label class="switch"><input type="checkbox" data-privacy="${key}" ${state.privacy[key] ? "checked" : ""} aria-label="${escapeHTML(title)}"/><span></span></label></div>`).join("")}<div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:20px"><button class="outline-btn" id="exportData">Export my demo data</button><button class="outline-btn" id="clearData">Clear local data</button><button class="outline-btn" id="resetDemo">Restore sample demo</button></div></section>`;
}
function renderView() {
  if (activeView === "overview") {
    $("#mainContent").innerHTML = originalOverviewHTML;
    renderOverview();
  } else if (activeView === "radar") renderRadar();
  else if (activeView === "tasks") renderTasks();
  else if (activeView === "resources") renderResources();
  else if (activeView === "profile") renderProfile();
  else if (activeView === "privacy") renderPrivacy();
}
const originalOverviewHTML = $("#mainContent").innerHTML;

function openTaskDialog() {
  $("#taskForm").reset();
  $("#taskDue").value = dateOffset(1);
  $("#taskDialog").showModal();
  $("#taskTitle").focus();
}
function addTask(formData) {
  state.tasks.push({ id: `t-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`, title: formData.get("title").trim(), area: formData.get("area"), due: formData.get("due"), priority: formData.get("priority"), done: false, source: "user" });
  saveState();
  $("#taskDialog").close();
  renderView();
  showToast("Task added to your list.");
}
function toggleTask(id) {
  const task = state.tasks.find(item => item.id === id);
  if (!task) return;
  task.done = !task.done;
  saveState();
  renderView();
  showToast(task.done ? "Nice work — task completed." : "Task moved back to open.");
}
function deleteTask(id) {
  state.tasks = state.tasks.filter(task => task.id !== id);
  saveState();
  renderTasks();
  showToast("Task deleted.");
}
function downloadData() {
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), profile: state.profile, tasks: state.tasks, privacy: state.privacy }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "lifebridge-ai-demo-data.json"; a.click();
  URL.revokeObjectURL(url);
  showToast("Your demo data export was prepared.");
}

document.addEventListener("click", event => {
  const nav = event.target.closest("[data-view]");
  if (nav) { navigate(nav.dataset.view); return; }
  const go = event.target.closest("[data-go]");
  if (go) { navigate(go.dataset.go); return; }
  const toggle = event.target.closest("[data-toggle-task]");
  if (toggle) { toggleTask(toggle.dataset.toggleTask); return; }
  const del = event.target.closest("[data-delete-task]");
  if (del) { if (confirm("Delete this task?")) deleteTask(del.dataset.deleteTask); return; }
  const close = event.target.closest("[data-close]");
  if (close) { document.getElementById(close.dataset.close).close(); return; }
  if (event.target.closest("#addTaskTop") || event.target.closest("#addTaskView")) { openTaskDialog(); return; }
  if (event.target.closest("#editProfileShortcut") || event.target.closest("#topAvatar")) { navigate("profile"); return; }
  if (event.target.closest("#menuToggle")) { $("#sidebar").classList.toggle("open"); return; }
  if (event.target.closest("#resetProfile")) { if (confirm("Reset profile details to the sample profile?")) { state.profile = clone(defaultState.profile); saveState(); renderProfile(); showToast("Profile reset."); } return; }
  if (event.target.closest("#exportData")) { downloadData(); return; }
  if (event.target.closest("#clearData")) {
    if (confirm("Clear saved demo data from this browser? This cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY);
      state = clone(defaultState);
      state.tasks = [];
      state.profile = { name: "", stage: "other", goals: "", interests: [], location: "", accessibility: "standard" };
      state.onboardingDone = true;
      activeView = "overview";
      navigate("overview");
      showToast("Local demo data cleared.");
    }
    return;
  }
  if (event.target.closest("#resetDemo")) {
    if (confirm("Restore the original sample profile and tasks?")) {
      state = clone(defaultState); saveState(); activeView = "overview"; navigate("overview"); showToast("Sample demo restored.");
    }
    return;
  }
  const demo = event.target.closest("[data-resource-demo]");
  if (demo) { event.preventDefault(); showToast(`${demo.dataset.resourceDemo}: sample resource only; connect a real tool to enable it.`); }
});
document.addEventListener("submit", event => {
  if (event.target.id === "taskForm") {
    event.preventDefault();
    const formData = new FormData(event.target);
    if (!String(formData.get("title") || "").trim()) return;
    addTask(formData);
  }
  if (event.target.id === "profileForm") {
    event.preventDefault();
    const form = event.target;
    state.profile = {
      name: form.elements.name.value.trim() || "Friend",
      stage: form.elements.stage.value,
      goals: form.elements.goals.value.trim(),
      location: form.elements.location.value.trim(),
      accessibility: form.elements.accessibility.value,
      interests: [...form.querySelectorAll('input[name="interests"]:checked')].map(input => input.value)
    };
    saveState();
    renderProfile();
    showToast("Your profile has been updated.");
  }
});
document.addEventListener("change", event => {
  if (event.target.id === "taskFilter") {
    const filter = event.target.value;
    $$("[data-task-row]").forEach(row => {
      const task = state.tasks.find(item => item.id === row.dataset.taskRow);
      row.hidden = filter === "open" ? task.done : filter === "done" ? !task.done : false;
    });
  }
  if (event.target.id === "resourceFilter") {
    $$("[data-category]").forEach(card => { card.hidden = event.target.value !== "all" && card.dataset.category !== event.target.value; });
  }
  if (event.target.matches("[data-privacy]")) {
    const key = event.target.dataset.privacy;
    state.privacy[key] = event.target.checked;
    if (key === "localStorage" && !event.target.checked) {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      showToast("Future changes will not be saved to this browser.");
    } else {
      saveState();
      showToast("Privacy preference updated.");
    }
    if (key === "personalization") renderPrivacy();
  }
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") $("#sidebar").classList.remove("open");
});
if (state.profile.accessibility === "large") document.documentElement.style.fontSize = "18px";
if (state.profile.accessibility === "simple") document.body.classList.add("simple-mode");
renderOverview();
