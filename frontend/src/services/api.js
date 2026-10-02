const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function loginUser(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Login failed");
    }

    return data;
}

async function apiRequest(endpoint, options = {}) {

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Request failed");
    }

    return data;
}

export function getStudents() {
    return apiRequest("/students");
}

export function getStudent(id) {
    return apiRequest(`/students/${id}`);
}

export function getTeachers() {
    return apiRequest("/teachers");
}

export function getMyTeacherProfile() {
    return apiRequest("/teachers/me");
}

export function getClasses() {
    return apiRequest("/classes");
}

export function getSubjects() {
    return apiRequest("/subjects");
}

export function getTerms() {
    return apiRequest("/terms");
}

export function getAcademicYears() {
    return apiRequest("/academic-years");
}

export function getReports() {
    return apiRequest("/reports");
}

export function getFullReport(id) {
    return apiRequest(`/reports/${id}/full`);
}

export function createReport(data) {
    return apiRequest("/reports", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function updatePrincipalComment(id, principalComment) {
    return apiRequest(`/reports/${id}/principal-comment`, {
        method: "PUT",
        body: JSON.stringify({ principal_comment: principalComment }),
    });
}

export function getMarks() {
    return apiRequest("/marks");
}

export function createMark(data) {
    return apiRequest("/marks", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function getUsers() {
    return apiRequest("/users");
}

export function createUser(data) {
    return apiRequest("/users", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function updateUser(id, data) {
    return apiRequest(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export function deleteUser(id) {
    return apiRequest(`/users/${id}`, {
        method: "DELETE",
    });
}