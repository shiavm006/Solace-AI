"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { register, login, saveToken, getToken, getCurrentUser, removeToken } from "@/lib/api";
import { SignInPage } from "@/components/ui/sign-in";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "employee">("employee");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const user = await getCurrentUser(token);
          // Redirect based on role
          if (user.role === "admin") {
            router.push("/dashboard");
          } else {
            router.push("/welcome");
          }
        } catch {
          removeToken();
          setCheckingAuth(false);
        }
      } else {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const rememberMe = formData.get("rememberMe") === "on";

    try {
      const response = await login({ email, password, remember_me: rememberMe });
        saveToken(response.access_token);
      setLoading(false);
        // Redirect based on role
        if (response.user.role === "admin") {
          router.push("/dashboard");
        } else {
          router.push("/welcome");
        }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/344498d3-18a3-4342-9fe8-144a6ce2e550',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:handleSignUp:start',message:'HandleSignUp called',data:{firstName:firstName,lastName:lastName,email:email,role:role},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'L'})}).catch(()=>{});
    // #endregion

    try {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/344498d3-18a3-4342-9fe8-144a6ce2e550',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:handleSignUp:before-register',message:'Calling register function',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'L'})}).catch(()=>{});
      // #endregion
      
        const response = await register({ first_name: firstName, last_name: lastName, email, password, role });
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/344498d3-18a3-4342-9fe8-144a6ce2e550',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:handleSignUp:after-register',message:'Register completed successfully',data:{hasToken:!!response.access_token},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'M'})}).catch(()=>{});
      // #endregion
      
        saveToken(response.access_token);
      setLoading(false);
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/344498d3-18a3-4342-9fe8-144a6ce2e550',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:handleSignUp:before-redirect',message:'About to redirect',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'M'})}).catch(()=>{});
      // #endregion
      
        // Redirect based on role
        if (response.user.role === "admin") {
          router.push("/dashboard");
        } else {
          router.push("/welcome");
        }
    } catch (err: any) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/344498d3-18a3-4342-9fe8-144a6ce2e550',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:handleSignUp:error',message:'HandleSignUp caught error',data:{errorMessage:err.message},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'N'})}).catch(()=>{});
      // #endregion
      setError(err.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Continue with Google clicked");
  };

  const handleResetPassword = () => {
    console.log("Reset Password clicked");
  };

  const handleCreateAccount = () => {
    setIsLogin(false);
    setError("");
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
    setError("");
  };

  if (checkingAuth) {
  return (
      <div className="bg-background text-foreground h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      <SignInPage
        isLogin={isLogin}
        heroImageSrc={undefined}
        testimonials={[]}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
        onSwitchToLogin={handleSwitchToLogin}
        error={error}
        loading={loading}
        firstName={firstName}
        onFirstNameChange={setFirstName}
        lastName={lastName}
        onLastNameChange={setLastName}
        email={email}
        onEmailChange={setEmail}
        password={password}
        onPasswordChange={setPassword}
        role={role}
        onRoleChange={setRole}
      />
    </div>
  );
}

