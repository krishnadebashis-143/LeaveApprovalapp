export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface Session {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  role: Role;
  fullName: string;
}

export interface EmployeeProfile {
  id: number;
  fullName: string;
  email: string;
  department: string;
  joinDate: string;
  role: Role;
  annualLeaveBalance: number;
}

export interface LeaveBalance {
  annualLeaveBalance: number;
  pendingDays: number;
  availableToRequest: number;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  department: string;
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewerNote: string | null;
}

export interface Employee {
  id: number;
  fullName: string;
  email: string;
  department: string;
  joinDate: string;
  role: Role;
  annualLeaveBalance?: number;
  salary?: number;
}

export interface Page<T> {
  content: T[];
  number: number;
  totalPages: number;
  totalElements: number;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

const apiBase = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080")
  .replace(/\/$/, "");

async function request<T>(
  path: string,
  token?: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${apiBase}${path}`, { ...options, headers });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (typeof body.message === "string") message = body.message;
    } catch {
      // Use the HTTP status message when the response is not JSON.
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function pageQuery(page: number, extra?: URLSearchParams): string {
  const params = new URLSearchParams(extra);
  params.set("page", String(page));
  params.set("size", "10");
  return params.toString();
}

export const api = {
  login(email: string, password: string) {
    return request<Session>("/api/auth/login", undefined, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  profile(token: string) {
    return request<EmployeeProfile>("/api/employees/me", token);
  },
  balance(token: string) {
    return request<LeaveBalance>("/api/employees/me/leave-balance", token);
  },
  myLeaves(token: string, page = 0) {
    return request<Page<LeaveRequest>>(`/api/leaves/mine?${pageQuery(page)}`, token);
  },
  inbox(token: string, page = 0) {
    return request<Page<LeaveRequest>>(`/api/leaves/inbox?${pageQuery(page)}`, token);
  },
  apply(token: string, startDate: string, endDate: string, reason: string) {
    return request<LeaveRequest>("/api/leaves", token, {
      method: "POST",
      body: JSON.stringify({ startDate, endDate, reason }),
    });
  },
  decide(token: string, id: number, decision: "APPROVE" | "REJECT", reviewerNote: string) {
    return request<LeaveRequest>(`/api/leaves/${id}/decision`, token, {
      method: "POST",
      body: JSON.stringify({ decision, reviewerNote: reviewerNote || null }),
    });
  },
  employees(token: string, admin: boolean, filters: URLSearchParams, page = 0) {
    const query = pageQuery(page, filters);
    return request<Page<Employee>>(
      `/api/${admin ? "admin/" : ""}employees?${query}`,
      token,
    );
  },
};
