const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: "admin" | "employee";
}

export interface LoginData {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  name?: string; // Computed property for backward compatibility
  email: string;
  role: "admin" | "employee";
  created_at?: string;
  last_login?: string;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/344498d3-18a3-4342-9fe8-144a6ce2e550',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:register:start',message:'Register function called',data:{email:data.email,name:data.name,hasPassword:!!data.password,role:data.role,apiUrl:`${API_BASE_URL}/api/auth/register`},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/344498d3-18a3-4342-9fe8-144a6ce2e550',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:register:fetch-start',message:'Starting register fetch',data:{url:`${API_BASE_URL}/api/auth/register`},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'F,G'})}).catch(()=>{});
    // #endregion
    
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/344498d3-18a3-4342-9fe8-144a6ce2e550',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:register:fetch-complete',message:'Register fetch completed',data:{status:response.status,ok:response.ok,statusText:response.statusText,contentType:response.headers.get('content-type')},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'F,H'})}).catch(()=>{});
    // #endregion

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Registration failed" }));
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/344498d3-18a3-4342-9fe8-144a6ce2e550',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:register:error',message:'Register failed with error',data:{status:response.status,errorDetail:error.detail},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      throw new Error(error.detail || "Registration failed");
    }

    const userData = await response.json();
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/344498d3-18a3-4342-9fe8-144a6ce2e550',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:register:success',message:'Registration successful, starting auto-login',data:{userId:userData.id,email:userData.email},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'I'})}).catch(()=>{});
    // #endregion
    
    // After successful registration, automatically log in the user
    try {
      const loginResponse = await login({ email: data.email, password: data.password });
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/344498d3-18a3-4342-9fe8-144a6ce2e550',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:register:login-success',message:'Auto-login successful',data:{hasToken:!!loginResponse.access_token},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'I'})}).catch(()=>{});
      // #endregion
      return loginResponse;
    } catch (loginError: any) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/344498d3-18a3-4342-9fe8-144a6ce2e550',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:register:login-error',message:'Auto-login failed',data:{error:loginError.message},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'I'})}).catch(()=>{});
      // #endregion
      // If auto-login fails, throw a more specific error
      throw new Error(`Registration successful, but automatic login failed: ${loginError.message || "Please try logging in manually"}`);
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/344498d3-18a3-4342-9fe8-144a6ce2e550',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:register:catch',message:'Register caught error',data:{errorName:error.name,errorMessage:error.message,isAbort:error.name==='AbortError'},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    if (error.name === 'AbortError') {
      throw new Error("Request timed out. Please check your connection and try again.");
    }
    throw error;
  }
}

export async function login(data: LoginData): Promise<AuthResponse> {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/344498d3-18a3-4342-9fe8-144a6ce2e550',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:login:start',message:'Login function called',data:{email:data.email,hasPassword:!!data.password,apiUrl:`${API_BASE_URL}/api/auth/login`},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'J'})}).catch(()=>{});
  // #endregion
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/344498d3-18a3-4342-9fe8-144a6ce2e550',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:login:response',message:'Login response received',data:{status:response.status,ok:response.ok,statusText:response.statusText},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'J,K'})}).catch(()=>{});
    // #endregion

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Login failed" }));
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/344498d3-18a3-4342-9fe8-144a6ce2e550',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:login:error',message:'Login failed',data:{status:response.status,errorDetail:error.detail},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'K'})}).catch(()=>{});
      // #endregion
      throw new Error(error.detail || "Login failed");
    }

    const result = await response.json();
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/344498d3-18a3-4342-9fe8-144a6ce2e550',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:login:success',message:'Login successful',data:{hasToken:!!result.access_token,tokenType:result.token_type,hasUser:!!result.user},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'J'})}).catch(()=>{});
    // #endregion
    return result;
  } catch (error: any) {
    clearTimeout(timeoutId);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/344498d3-18a3-4342-9fe8-144a6ce2e550',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:login:catch',message:'Login caught error',data:{errorName:error.name,errorMessage:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'K'})}).catch(()=>{});
    // #endregion
    if (error.name === 'AbortError') {
      throw new Error("Request timed out. Please check your connection and try again.");
    }
    throw error;
  }
}

export async function getCurrentUser(token: string): Promise<User> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error("Failed to get user info");
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error("Request timed out");
    }
    throw error;
  }
}

export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
}

export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
}


