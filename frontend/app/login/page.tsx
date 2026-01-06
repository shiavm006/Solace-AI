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

    try {
      const response = await register({ first_name: firstName, last_name: lastName, email, password, role });
      saveToken(response.access_token);
      setLoading(false);
      
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

