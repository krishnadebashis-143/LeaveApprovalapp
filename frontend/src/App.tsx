import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Languages,
  LogOut,
  Search,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import {
  api,
  ApiError,
  type Employee,
  type EmployeeProfile,
  type LeaveBalance,
  type LeaveRequest,
  type Page,
  type Role,
  type Session,
} from "./api";

type Language = "en" | "hi";
type View = "overview" | "leaves" | "approvals" | "employees";

const text = {
  en: {
    brand: "LeaveFlow",
    tagline: "Leave, made clear.",
    signIn: "Sign in to your workspace",
    signInHelp: "Use your work account to manage time off.",
    email: "Work email",
    password: "Password",
    signInButton: "Sign in",
    demoAccounts: "Local demo accounts",
    demoHelp: "Select an account to fill in the login form.",
    overview: "Overview",
    myLeave: "My leave",
    approvals: "Approvals",
    employees: "Employees",
    signOut: "Sign out",
    welcome: "Welcome back",
    overviewSubtitle: "Here’s your leave snapshot and what needs attention.",
    available: "Available to request",
    annual: "Annual allowance",
    pendingDays: "Pending days",
    quickAction: "Plan some time off",
    quickActionHelp: "Send a leave request to your manager in a few steps.",
    requestLeave: "Request leave",
    recentRequests: "Recent requests",
    seeAll: "See all",
    noRequests: "No leave requests yet.",
    applyTitle: "Request time off",
    applySubtitle: "Your request will be sent to the appropriate reviewer.",
    startDate: "Start date",
    endDate: "End date",
    reason: "Reason",
    reasonPlaceholder: "Add a short note for your reviewer",
    submitRequest: "Submit request",
    submitting: "Submitting…",
    requestHistory: "Request history",
    requestedDates: "Dates",
    days: "Days",
    status: "Status",
    reviewer: "Reviewer",
    reviewerNote: "Reviewer note",
    noHistory: "No requests to show. Your future requests will appear here.",
    approvalsTitle: "Approval inbox",
    approvalsSubtitle: "Review pending requests from your team.",
    employee: "Employee",
    department: "Department",
    dates: "Requested dates",
    noteForEmployee: "Note for employee (required to reject)",
    notePlaceholder: "Add a reason if rejecting",
    approve: "Approve",
    reject: "Reject",
    noApprovals: "You’re all caught up. There are no pending requests.",
    directoryTitle: "Employee directory",
    directorySubtitle: "Find people by name, department, or joining date.",
    name: "Name",
    namePlaceholder: "Search by name",
    departmentPlaceholder: "Search department",
    joinedFrom: "Joined from",
    joinedTo: "Joined to",
    search: "Search",
    clear: "Clear",
    role: "Role",
    joinDate: "Join date",
    balance: "Leave balance",
    salary: "Salary",
    noEmployees: "No employees match these filters.",
    page: "Page",
    of: "of",
    profile: "Your profile",
    loading: "Loading your workspace…",
    loginError: "Could not sign in.",
    missingRejectNote: "Please add a note before rejecting this request.",
    language: "हिन्दी",
    workspace: "WORKSPACE",
    leaveManagement: "LEAVE MANAGEMENT",
    employeeOnly: "Employees",
    approved: "Approved",
    rejected: "Rejected",
    pending: "Pending",
    admin: "Admin",
    manager: "Manager",
    yourTeam: "Your team",
    requestSubmitted: "Leave request submitted.",
    requestApproved: "Request approved.",
    requestRejected: "Request rejected.",
    allDepartments: "All departments",
    sessionExpired: "Your session expired. Please sign in again.",
    salaryNotice: "Salary information is visible only to administrators.",
    demoWarning: "Demo credentials are for local development only.",
  },
  hi: {
    brand: "LeaveFlow",
    tagline: "छुट्टी, अब आसान।",
    signIn: "अपने कार्यक्षेत्र में साइन इन करें",
    signInHelp: "छुट्टी प्रबंधन के लिए अपने कार्य खाते का उपयोग करें।",
    email: "कार्य ईमेल",
    password: "पासवर्ड",
    signInButton: "साइन इन",
    demoAccounts: "स्थानीय डेमो खाते",
    demoHelp: "लॉगिन फ़ॉर्म भरने के लिए कोई खाता चुनें।",
    overview: "अवलोकन",
    myLeave: "मेरी छुट्टी",
    approvals: "अनुमोदन",
    employees: "कर्मचारी",
    signOut: "साइन आउट",
    welcome: "वापसी पर स्वागत है",
    overviewSubtitle: "आपकी छुट्टी का सारांश और ध्यान देने योग्य बातें।",
    available: "उपलब्ध छुट्टी",
    annual: "वार्षिक अवकाश",
    pendingDays: "लंबित दिन",
    quickAction: "छुट्टी की योजना बनाएँ",
    quickActionHelp: "कुछ आसान चरणों में प्रबंधक को अनुरोध भेजें।",
    requestLeave: "छुट्टी का अनुरोध",
    recentRequests: "हाल के अनुरोध",
    seeAll: "सभी देखें",
    noRequests: "अभी तक कोई छुट्टी अनुरोध नहीं।",
    applyTitle: "छुट्टी का अनुरोध करें",
    applySubtitle: "आपका अनुरोध संबंधित समीक्षक को भेजा जाएगा।",
    startDate: "आरंभ तिथि",
    endDate: "समाप्ति तिथि",
    reason: "कारण",
    reasonPlaceholder: "समीक्षक के लिए संक्षिप्त नोट लिखें",
    submitRequest: "अनुरोध भेजें",
    submitting: "भेजा जा रहा है…",
    requestHistory: "अनुरोध इतिहास",
    requestedDates: "तिथियाँ",
    days: "दिन",
    status: "स्थिति",
    reviewer: "समीक्षक",
    reviewerNote: "समीक्षक का नोट",
    noHistory: "अभी कोई अनुरोध नहीं। आपके अनुरोध यहाँ दिखेंगे।",
    approvalsTitle: "अनुमोदन इनबॉक्स",
    approvalsSubtitle: "अपनी टीम के लंबित अनुरोधों की समीक्षा करें।",
    employee: "कर्मचारी",
    department: "विभाग",
    dates: "अनुरोधित तिथियाँ",
    noteForEmployee: "कर्मचारी के लिए नोट (अस्वीकृति पर आवश्यक)",
    notePlaceholder: "अस्वीकृति का कारण लिखें",
    approve: "स्वीकृत करें",
    reject: "अस्वीकार करें",
    noApprovals: "सब अनुरोध देख लिए गए हैं। कोई अनुरोध लंबित नहीं।",
    directoryTitle: "कर्मचारी निर्देशिका",
    directorySubtitle: "नाम, विभाग या नौकरी शुरू करने की तिथि से खोजें।",
    name: "नाम",
    namePlaceholder: "नाम से खोजें",
    departmentPlaceholder: "विभाग खोजें",
    joinedFrom: "इस तिथि से",
    joinedTo: "इस तिथि तक",
    search: "खोजें",
    clear: "साफ़ करें",
    role: "भूमिका",
    joinDate: "कार्य आरंभ",
    balance: "अवकाश शेष",
    salary: "वेतन",
    noEmployees: "इन फ़िल्टर से कोई कर्मचारी नहीं मिला।",
    page: "पृष्ठ",
    of: "में से",
    profile: "आपकी प्रोफ़ाइल",
    loading: "कार्यक्षेत्र लोड हो रहा है…",
    loginError: "साइन इन नहीं हो सका।",
    missingRejectNote: "अनुरोध अस्वीकार करने से पहले नोट लिखें।",
    language: "English",
    workspace: "कार्यक्षेत्र",
    leaveManagement: "छुट्टी प्रबंधन",
    employeeOnly: "कर्मचारी",
    approved: "स्वीकृत",
    rejected: "अस्वीकृत",
    pending: "लंबित",
    admin: "प्रशासक",
    manager: "प्रबंधक",
    yourTeam: "आपकी टीम",
    requestSubmitted: "छुट्टी का अनुरोध भेज दिया गया।",
    requestApproved: "अनुरोध स्वीकृत हुआ।",
    requestRejected: "अनुरोध अस्वीकार हुआ।",
    allDepartments: "सभी विभाग",
    sessionExpired: "आपका सत्र समाप्त हो गया। कृपया फिर साइन इन करें।",
    salaryNotice: "वेतन की जानकारी केवल प्रशासकों को दिखाई देती है।",
    demoWarning: "डेमो पासवर्ड केवल स्थानीय विकास के लिए हैं।",
  },
} as const;

const demoAccounts: { role: Role; email: string; password: string; name: string }[] = [
  { role: "EMPLOYEE", email: "employee@example.com", password: "Employee123!", name: "Elliot" },
  { role: "EMPLOYEE", email: "employee2@example.com", password: "Employee123!", name: "Jordan" },
  { role: "MANAGER", email: "manager@example.com", password: "Manager123!", name: "Morgan" },
  { role: "ADMIN", email: "admin@example.com", password: "Admin123!", name: "Avery" },
];

function dateLabel(date: string, language: Language) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(language === "hi" ? "hi-IN" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function todayInputDate() {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
}

function roleLabel(role: Role, t: typeof text[Language]) {
  if (role === "ADMIN") return t.admin;
  if (role === "MANAGER") return t.manager;
  return t.employeeOnly;
}

function statusLabel(status: LeaveRequest["status"], t: typeof text[Language]) {
  if (status === "APPROVED") return t.approved;
  if (status === "REJECTED") return t.rejected;
  return t.pending;
}

function storedSession(): Session | null {
  try {
    const raw = sessionStorage.getItem("leaveflow-session");
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    if (
      typeof session.accessToken === "string" &&
      typeof session.fullName === "string" &&
      ["ADMIN", "MANAGER", "EMPLOYEE"].includes(session.role)
    ) {
      return session;
    }
  } catch {
    sessionStorage.removeItem("leaveflow-session");
  }
  return null;
}

export default function App() {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem("leaveflow-language") === "hi" ? "hi" : "en"),
  );
  const t = text[language];
  const [session, setSession] = useState<Session | null>(storedSession);
  const [view, setView] = useState<View>("overview");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [myLeaves, setMyLeaves] = useState<Page<LeaveRequest> | null>(null);
  const [inbox, setInbox] = useState<Page<LeaveRequest> | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [employeePage, setEmployeePage] = useState<Page<Employee> | null>(null);
  const [filters, setFilters] = useState({ name: "", department: "", joinedFrom: "", joinedTo: "" });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const canReview = session?.role === "ADMIN" || session?.role === "MANAGER";
  const canSearchEmployees = canReview;

  const signOut = useCallback(() => {
    sessionStorage.removeItem("leaveflow-session");
    setSession(null);
    setProfile(null);
    setBalance(null);
    setMyLeaves(null);
    setInbox(null);
    setEmployeePage(null);
    setView("overview");
  }, []);

  const handleFailure = useCallback((cause: unknown) => {
    if (cause instanceof ApiError && cause.status === 401) {
      signOut();
      setError(text[language].sessionExpired);
      return;
    }
    setError(cause instanceof Error ? cause.message : "Something went wrong.");
  }, [language, signOut]);

  const loadCore = useCallback(async (token: string, page = 0) => {
    setLoading(true);
    setError("");
    try {
      const [nextProfile, nextBalance, nextLeaves] = await Promise.all([
        api.profile(token),
        api.balance(token),
        api.myLeaves(token, page),
      ]);
      setProfile(nextProfile);
      setBalance(nextBalance);
      setMyLeaves(nextLeaves);
    } catch (cause) {
      handleFailure(cause);
    } finally {
      setLoading(false);
    }
  }, [handleFailure]);

  useEffect(() => {
    if (session) void loadCore(session.accessToken);
  }, [session?.accessToken, loadCore]);

  useEffect(() => {
    localStorage.setItem("leaveflow-language", language);
    document.documentElement.lang = language === "hi" ? "hi" : "en";
  }, [language]);

  useEffect(() => {
    if (!session || view !== "approvals" || !canReview) return;
    setLoading(true);
    api.inbox(session.accessToken)
      .then(setInbox)
      .catch(handleFailure)
      .finally(() => setLoading(false));
  }, [session, view, canReview, handleFailure]);

  const title = useMemo(() => {
    if (view === "leaves") return t.myLeave;
    if (view === "approvals") return t.approvals;
    if (view === "employees") return t.employees;
    return t.overview;
  }, [t, view]);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSigningIn(true);
    setError("");
    try {
      const result = await api.login(email.trim(), password);
      sessionStorage.setItem("leaveflow-session", JSON.stringify(result));
      setSession(result);
      setView("overview");
      setPassword("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.loginError);
    } finally {
      setSigningIn(false);
    }
  }

  async function submitLeave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api.apply(session.accessToken, startDate, endDate, reason.trim());
      setStartDate("");
      setEndDate("");
      setReason("");
      setNotice(t.requestSubmitted);
      await loadCore(session.accessToken);
    } catch (cause) {
      handleFailure(cause);
    } finally {
      setBusy(false);
    }
  }

  async function decide(request: LeaveRequest, decision: "APPROVE" | "REJECT") {
    if (!session) return;
    const reviewerNote = notes[request.id] ?? "";
    if (decision === "REJECT" && !reviewerNote.trim()) {
      setError(t.missingRejectNote);
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api.decide(session.accessToken, request.id, decision, reviewerNote.trim());
      setNotice(decision === "APPROVE" ? t.requestApproved : t.requestRejected);
      setNotes((current) => ({ ...current, [request.id]: "" }));
      const [nextInbox, nextBalance, nextLeaves] = await Promise.all([
        api.inbox(session.accessToken),
        api.balance(session.accessToken),
        api.myLeaves(session.accessToken),
      ]);
      setInbox(nextInbox);
      setBalance(nextBalance);
      setMyLeaves(nextLeaves);
    } catch (cause) {
      handleFailure(cause);
    } finally {
      setBusy(false);
    }
  }

  async function loadInboxPage(page: number) {
    if (!session) return;
    setLoading(true);
    try {
      setInbox(await api.inbox(session.accessToken, page));
    } catch (cause) {
      handleFailure(cause);
    } finally {
      setLoading(false);
    }
  }

  async function searchEmployees(page = 0) {
    if (!session) return;
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim()) query.set(key, value.trim());
    });
    setBusy(true);
    setError("");
    try {
      const results = await api.employees(session.accessToken, session.role === "ADMIN", query, page);
      setEmployeePage(results);
    } catch (cause) {
      handleFailure(cause);
    } finally {
      setBusy(false);
    }
  }

  function changeView(nextView: View) {
    setView(nextView);
    setError("");
    setNotice("");
    if (nextView === "employees") {
      setEmployeePage(null);
    }
  }

  if (!session) {
    return (
      <main className="login-layout">
        <section className="login-intro">
          <a className="brand brand-light" href="/" aria-label={t.brand}>
            <span className="brand-icon"><CalendarDays size={22} /></span>
            <span>{t.brand}</span>
          </a>
          <div className="intro-content">
            <span className="eyebrow">{t.leaveManagement}</span>
            <h1>{language === "en" ? "A better way to take time off." : "छुट्टी प्रबंधन का बेहतर तरीका।"}</h1>
            <p>{language === "en"
              ? "A thoughtful place for people, managers, and teams to plan time away with confidence."
              : "कर्मचारियों और प्रबंधकों के लिए छुट्टी की योजना बनाने का एक आसान मंच।"}</p>
            <div className="intro-points">
              <span><Check size={16} /> {language === "en" ? "Simple leave requests" : "आसान छुट्टी अनुरोध"}</span>
              <span><Check size={16} /> {language === "en" ? "Clear approvals" : "स्पष्ट अनुमोदन प्रक्रिया"}</span>
              <span><Check size={16} /> {language === "en" ? "One team workspace" : "एक ही टीम कार्यक्षेत्र"}</span>
            </div>
          </div>
          <span className="intro-foot">{t.tagline}</span>
        </section>

        <section className="login-panel">
          <button className="language-button login-language" onClick={() => setLanguage(language === "en" ? "hi" : "en")}>
            <Languages size={17} /> {t.language}
          </button>
          <div className="login-card">
            <div className="mobile-brand brand">
              <span className="brand-icon"><CalendarDays size={21} /></span>{t.brand}
            </div>
            <div className="section-kicker">{t.workspace}</div>
            <h2>{t.signIn}</h2>
            <p className="muted">{t.signInHelp}</p>
            {error && <div className="alert alert-error" role="alert">{error}</div>}
            <form className="form-stack" onSubmit={submitLogin}>
              <label>{t.email}
                <input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" />
              </label>
              <label>{t.password}
                <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••" />
              </label>
              <button className="button button-primary button-wide" type="submit" disabled={signingIn}>
                {signingIn ? t.loading : t.signInButton}<ArrowRight size={17} />
              </button>
            </form>
            <div className="demo-block">
              <div className="demo-title">{t.demoAccounts}</div>
              <p>{t.demoHelp}</p>
              <div className="demo-list">
                {demoAccounts.map((account) => (
                  <button className="demo-account" key={account.role} onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                    setError("");
                  }}>
                    <span className={`avatar avatar-${account.role.toLowerCase()}`}>{account.name[0]}</span>
                    <span><strong>{account.name}</strong><small>{roleLabel(account.role, t)}</small></span>
                    <ArrowRight className="demo-arrow" size={16} />
                  </button>
                ))}
              </div>
            </div>
            <p className="demo-warning">{t.demoWarning}</p>
          </div>
        </section>
      </main>
    );
  }

  const navItems: { id: View; label: string; icon: typeof CalendarDays }[] = [
    { id: "overview", label: t.overview, icon: CalendarDays },
    { id: "leaves", label: t.myLeave, icon: Clock3 },
    ...(canReview ? [{ id: "approvals" as View, label: t.approvals, icon: ClipboardCheck }] : []),
    ...(canSearchEmployees ? [{ id: "employees" as View, label: t.employees, icon: UsersRound }] : []),
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label={t.brand}>
          <span className="brand-icon"><CalendarDays size={21} /></span><span>{t.brand}</span>
        </a>
        <div className="sidebar-label">{t.workspace}</div>
        <nav className="side-nav" aria-label={t.workspace}>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${view === id ? "active" : ""}`} onClick={() => changeView(id)}>
              <Icon size={18} /><span>{label}</span>
              {id === "approvals" && inbox?.totalElements ? <span className="nav-count">{inbox.totalElements}</span> : null}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <span className="avatar avatar-user">{profile?.fullName?.[0] ?? session.fullName[0]}</span>
            <span className="profile-label"><strong>{profile?.fullName ?? session.fullName}</strong><small>{roleLabel(session.role, t)}</small></span>
          </div>
          <button className="nav-item logout-button" onClick={signOut}><LogOut size={18} /><span>{t.signOut}</span></button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span>{t.workspace}</span><span className="crumb-separator">/</span><strong>{title}</strong></div>
          <div className="topbar-actions">
            <button className="language-button" onClick={() => setLanguage(language === "en" ? "hi" : "en")}><Languages size={17} />{t.language}</button>
            <span className="topbar-divider" />
            <div className="topbar-user"><span className="avatar avatar-user">{profile?.fullName?.[0] ?? session.fullName[0]}</span><span>{profile?.fullName ?? session.fullName}</span></div>
            <button className="topbar-logout" onClick={signOut} aria-label={t.signOut} title={t.signOut}><LogOut size={17} /></button>
          </div>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <div className="section-kicker">{t.leaveManagement}</div>
              <h1>{view === "overview" ? `${t.welcome}, ${(profile?.fullName ?? session.fullName).split(" ")[0]}` : title}</h1>
              <p className="muted">{view === "overview" ? t.overviewSubtitle : view === "approvals" ? t.approvalsSubtitle : view === "employees" ? t.directorySubtitle : t.applySubtitle}</p>
            </div>
            {view !== "leaves" && view !== "approvals" && view !== "employees" && (
              <button className="button button-primary" onClick={() => changeView("leaves")}><ArrowDownToLine size={17} />{t.requestLeave}</button>
            )}
          </div>

          {error && <div className="alert alert-error" role="alert"><X size={18} />{error}<button className="alert-close" onClick={() => setError("")} aria-label="Dismiss"><X size={16} /></button></div>}
          {notice && <div className="alert alert-success" role="status"><Check size={18} />{notice}<button className="alert-close" onClick={() => setNotice("")} aria-label="Dismiss"><X size={16} /></button></div>}
          {loading && !profile ? <div className="loading-state"><span className="spinner" />{t.loading}</div> : (
            <>
              {view === "overview" && (
                <div className="overview-grid">
                  <section className="metric-grid">
                    <article className="metric-card metric-primary">
                      <span className="metric-icon"><CalendarDays size={19} /></span>
                      <span className="metric-label">{t.available}</span>
                      <div className="metric-value">{balance?.availableToRequest ?? "—"} <small>{t.days.toLowerCase()}</small></div>
                      <div className="metric-foot">{balance?.pendingDays ?? 0} {t.pendingDays.toLowerCase()}</div>
                    </article>
                    <article className="metric-card">
                      <span className="metric-icon metric-icon-blue"><ShieldCheck size={19} /></span>
                      <span className="metric-label">{t.annual}</span>
                      <div className="metric-value">{balance?.annualLeaveBalance ?? "—"} <small>{t.days.toLowerCase()}</small></div>
                      <div className="metric-foot">{profile?.department ?? ""}</div>
                    </article>
                    <article className="metric-card">
                      <span className="metric-icon metric-icon-amber"><Clock3 size={19} /></span>
                      <span className="metric-label">{t.pendingDays}</span>
                      <div className="metric-value">{balance?.pendingDays ?? "—"} <small>{t.days.toLowerCase()}</small></div>
                      <div className="metric-foot">{myLeaves?.totalElements ?? 0} {t.requestHistory.toLowerCase()}</div>
                    </article>
                  </section>
                  <section className="quick-card">
                    <div className="quick-art"><CalendarDays size={33} /></div>
                    <div className="section-kicker">{t.quickAction}</div>
                    <h2>{t.quickActionHelp}</h2>
                    <button className="button button-primary" onClick={() => changeView("leaves")}>{t.requestLeave}<ArrowRight size={17} /></button>
                  </section>
                  <section className="panel recent-panel">
                    <div className="panel-heading"><div><h2>{t.recentRequests}</h2><p>{t.requestHistory}</p></div><button className="text-button" onClick={() => changeView("leaves")}>{t.seeAll}<ArrowRight size={15} /></button></div>
                    {myLeaves?.content.length ? <LeaveTable requests={myLeaves.content.slice(0, 5)} language={language} t={t} compact /> : <div className="empty-state"><span className="empty-icon"><CalendarDays size={22} /></span><p>{t.noRequests}</p></div>}
                  </section>
                  <section className="profile-card">
                    <div className="profile-card-head"><span className="avatar avatar-large avatar-user">{profile?.fullName?.[0] ?? session.fullName[0]}</span><div><span className="section-kicker">{t.profile}</span><h2>{profile?.fullName ?? session.fullName}</h2></div></div>
                    <div className="profile-details">
                      <div><span>{t.email}</span><strong>{profile?.email ?? "—"}</strong></div>
                      <div><span>{t.department}</span><strong>{profile?.department ?? "—"}</strong></div>
                      <div><span>{t.role}</span><strong>{roleLabel(profile?.role ?? session.role, t)}</strong></div>
                      <div><span>{t.joinDate}</span><strong>{profile?.joinDate ? dateLabel(profile.joinDate, language) : "—"}</strong></div>
                    </div>
                  </section>
                </div>
              )}

              {view === "leaves" && (
                <div className="two-column-layout">
                  <section className="panel form-panel">
                    <div className="panel-heading"><div><span className="section-kicker">{t.leaveManagement}</span><h2>{t.applyTitle}</h2><p>{t.applySubtitle}</p></div></div>
                    <div className="balance-hint"><CalendarDays size={18} /><span>{t.available}: <strong>{balance?.availableToRequest ?? "—"} {t.days.toLowerCase()}</strong></span></div>
                    <form className="form-stack" onSubmit={submitLeave}>
                      <div className="date-grid">
                        <label>{t.startDate}<input type="date" required min={todayInputDate()} value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
                        <label>{t.endDate}<input type="date" required min={startDate || todayInputDate()} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
                      </div>
                      <label>{t.reason}<textarea required maxLength={500} rows={4} value={reason} onChange={(event) => setReason(event.target.value)} placeholder={t.reasonPlaceholder} /></label>
                      <div className="form-bottom"><span>{reason.length}/500</span><button className="button button-primary" type="submit" disabled={busy}>{busy ? t.submitting : t.submitRequest}<ArrowRight size={17} /></button></div>
                    </form>
                  </section>
                  <section className="panel history-panel">
                    <div className="panel-heading"><div><h2>{t.requestHistory}</h2><p>{myLeaves?.totalElements ?? 0} {t.requestHistory.toLowerCase()}</p></div></div>
                    {myLeaves?.content.length ? (
                      <>
                        <LeaveTable requests={myLeaves.content} language={language} t={t} />
                        <Pager page={myLeaves.number} totalPages={myLeaves.totalPages} t={t} onPage={(page) => session && void loadCore(session.accessToken, page)} />
                      </>
                    ) : <div className="empty-state"><span className="empty-icon"><CalendarDays size={22} /></span><p>{t.noHistory}</p></div>}
                  </section>
                </div>
              )}

              {view === "approvals" && (
                <section className="panel table-panel">
                  <div className="panel-heading"><div><span className="section-kicker">{t.yourTeam}</span><h2>{t.approvalsTitle}</h2><p>{t.approvalsSubtitle}</p></div><span className="request-count"><ClipboardCheck size={16} />{inbox?.totalElements ?? 0}</span></div>
                  {inbox?.content.length ? (
                    <>
                      <div className="approval-list">
                        {inbox.content.map((request) => (
                          <article className="approval-card" key={request.id}>
                            <div className="approval-main">
                              <span className="avatar avatar-employee">{request.employeeName[0]}</span>
                              <div className="approval-person"><h3>{request.employeeName}</h3><span>{request.employeeEmail} · {request.department}</span></div>
                              <div className="approval-dates"><strong>{dateLabel(request.startDate, language)} – {dateLabel(request.endDate, language)}</strong><span>{request.daysRequested} {t.days.toLowerCase()}</span></div>
                            </div>
                            <p className="approval-reason">{request.reason}</p>
                            <div className="approval-actions">
                              <input aria-label={t.noteForEmployee} maxLength={500} value={notes[request.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))} placeholder={t.notePlaceholder} />
                              <button className="button button-outline-danger" disabled={busy} onClick={() => void decide(request, "REJECT")}><X size={16} />{t.reject}</button>
                              <button className="button button-primary button-approve" disabled={busy} onClick={() => void decide(request, "APPROVE")}><Check size={16} />{t.approve}</button>
                            </div>
                          </article>
                        ))}
                      </div>
                      <Pager page={inbox.number} totalPages={inbox.totalPages} t={t} onPage={(page) => void loadInboxPage(page)} />
                    </>
                  ) : <div className="empty-state"><span className="empty-icon"><Check size={22} /></span><p>{t.noApprovals}</p></div>}
                </section>
              )}

              {view === "employees" && (
                <section className="panel directory-panel">
                  <div className="panel-heading"><div><span className="section-kicker">{t.workspace}</span><h2>{t.directoryTitle}</h2><p>{t.directorySubtitle}</p></div></div>
                  {session.role === "ADMIN" && <div className="salary-notice"><ShieldCheck size={17} />{t.salaryNotice}</div>}
                  <form className="filter-form" onSubmit={(event) => { event.preventDefault(); void searchEmployees(); }}>
                    <label>{t.name}<input value={filters.name} onChange={(event) => setFilters({ ...filters, name: event.target.value })} placeholder={t.namePlaceholder} /></label>
                    <label>{t.department}<input value={filters.department} onChange={(event) => setFilters({ ...filters, department: event.target.value })} placeholder={t.departmentPlaceholder} /></label>
                    <label>{t.joinedFrom}<input type="date" value={filters.joinedFrom} onChange={(event) => setFilters({ ...filters, joinedFrom: event.target.value })} /></label>
                    <label>{t.joinedTo}<input type="date" value={filters.joinedTo} onChange={(event) => setFilters({ ...filters, joinedTo: event.target.value })} /></label>
                    <div className="filter-buttons">
                      <button className="button button-primary" type="submit" disabled={busy}><Search size={16} />{t.search}</button>
                      <button className="button button-quiet" type="button" onClick={() => { setFilters({ name: "", department: "", joinedFrom: "", joinedTo: "" }); setEmployeePage(null); }}>{t.clear}</button>
                    </div>
                  </form>
                  {employeePage ? employeePage.content.length ? (
                    <>
                      <div className="table-scroll"><table><thead><tr><th>{t.employee}</th><th>{t.department}</th><th>{t.role}</th><th>{t.joinDate}</th><th>{t.balance}</th>{session.role === "ADMIN" && <th>{t.salary}</th>}</tr></thead>
                        <tbody>{employeePage.content.map((employee) => <tr key={employee.id}>
                          <td><div className="employee-cell"><span className="avatar avatar-employee">{employee.fullName[0]}</span><span><strong>{employee.fullName}</strong><small>{employee.email}</small></span></div></td>
                          <td>{employee.department}</td><td><span className={`role-pill role-${employee.role.toLowerCase()}`}>{roleLabel(employee.role, t)}</span></td>
                          <td>{dateLabel(employee.joinDate, language)}</td><td>{employee.annualLeaveBalance ?? "—"} {t.days.toLowerCase()}</td>
                          {session.role === "ADMIN" && <td>{employee.salary == null ? "—" : new Intl.NumberFormat(language === "hi" ? "hi-IN" : "en-US", { maximumFractionDigits: 2 }).format(employee.salary)}</td>}
                        </tr>)}</tbody>
                      </table></div>
                      <Pager page={employeePage.number} totalPages={employeePage.totalPages} t={t} onPage={(page) => void searchEmployees(page)} />
                    </>
                  ) : <div className="empty-state"><span className="empty-icon"><UsersRound size={22} /></span><p>{t.noEmployees}</p></div> : (
                    <div className="directory-empty"><span className="empty-icon"><Search size={22} /></span><p>{t.directorySubtitle}</p></div>
                  )}
                </section>
              )}
            </>
          )}
          <footer className="page-footer">{t.brand} <span>·</span> {t.tagline}</footer>
        </div>
      </main>
    </div>
  );
}

function LeaveTable({
  requests,
  language,
  t,
  compact = false,
}: {
  requests: LeaveRequest[];
  language: Language;
  t: typeof text[Language];
  compact?: boolean;
}) {
  return (
    <div className={`leave-list ${compact ? "leave-list-compact" : ""}`}>
      {requests.map((request) => (
        <article className="leave-row" key={request.id}>
          <span className="leave-date-icon"><CalendarDays size={17} /></span>
          <div className="leave-row-main">
            <strong>{dateLabel(request.startDate, language)} – {dateLabel(request.endDate, language)}</strong>
            <span>{request.daysRequested} {t.days.toLowerCase()} · {request.reason}</span>
            {request.reviewerNote && <small>{t.reviewerNote}: {request.reviewerNote}</small>}
          </div>
          <span className={`status-pill status-${request.status.toLowerCase()}`}><span />{statusLabel(request.status, t)}</span>
        </article>
      ))}
    </div>
  );
}

function Pager({
  page,
  totalPages,
  t,
  onPage,
}: {
  page: number;
  totalPages: number;
  t: typeof text[Language];
  onPage: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="pager">
      <button className="button button-quiet" disabled={page <= 0} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft size={17} /></button>
      <span>{t.page} {page + 1} {t.of} {totalPages}</span>
      <button className="button button-quiet" disabled={page + 1 >= totalPages} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight size={17} /></button>
    </div>
  );
}
