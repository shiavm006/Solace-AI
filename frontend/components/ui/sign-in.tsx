import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';



const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
    </svg>
);



export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  isLogin?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onSignUp?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
  onSwitchToLogin?: () => void;
  error?: string;
  loading?: boolean;
  firstName?: string;
  onFirstNameChange?: (value: string) => void;
  lastName?: string;
  onLastNameChange?: (value: string) => void;
  email?: string;
  onEmailChange?: (value: string) => void;
  password?: string;
  onPasswordChange?: (value: string) => void;
  role?: "admin" | "employee";
  onRoleChange?: (value: "admin" | "employee") => void;
}



const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-[var(--border)] bg-[var(--foreground)]/5 backdrop-blur-sm transition-colors focus-within:border-yellow-400/70 focus-within:bg-yellow-500/10">
    {children}
  </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
  <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-[var(--card)]/40 dark:bg-zinc-800/40 backdrop-blur-xl border border-white/10 p-5 w-64`}>
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-medium">{testimonial.name}</p>
      <p className="text-[var(--muted-foreground)]">{testimonial.handle}</p>
      <p className="mt-1 text-[var(--foreground)]/80">{testimonial.text}</p>
    </div>
  </div>
);



export const SignInPage: React.FC<SignInPageProps> = ({
  isLogin = true,
  title,
  description,
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onSignUp,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
  onSwitchToLogin,
  error,
  loading = false,
  firstName = "",
  onFirstNameChange,
  lastName = "",
  onLastNameChange,
  email = "",
  onEmailChange,
  password = "",
  onPasswordChange,
  role = "employee",
  onRoleChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const defaultTitle = isLogin 
    ? <span className="font-light text-[var(--foreground)] tracking-tighter">Welcome</span>
    : <span className="font-light text-[var(--foreground)] tracking-tighter">Create Account</span>;
  
  const defaultDescription = isLogin
    ? "Access your account and continue your journey with us"
    : "Start your journey with Solace AI and unlock new possibilities";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLogin && onSignIn) {
      onSignIn(e);
    } else if (!isLogin && onSignUp) {
      onSignUp(e);
    }
  };

  return (
    <div className={`h-[100dvh] flex font-geist w-[100dvw] ${heroImageSrc ? 'flex-col md:flex-row' : 'items-center justify-center'}`}>
      {/* Left column: sign-in/sign-up form */}
      <section className={`flex-1 flex items-center justify-center p-6 md:p-8 ${!heroImageSrc ? 'w-full' : ''}`}>
        <div className={`w-full ${heroImageSrc ? 'max-w-md' : 'max-w-md'}`}>
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <h1 className="animate-element animate-delay-100 text-2xl md:text-3xl font-semibold leading-tight">
                {title || defaultTitle}
              </h1>
              <p className="animate-element animate-delay-200 text-sm text-[var(--muted-foreground)]">
                {description || defaultDescription}
              </p>
            </div>

            {error && (
              <div className="animate-element animate-delay-250 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="animate-element animate-delay-300 space-y-2">
                  <label className="text-xs font-medium text-[var(--muted-foreground)] block animate-element animate-delay-300">Name</label>
                  <div className="flex gap-3">
                    <GlassInputWrapper className="flex-1">
                      <input 
                        name="firstName" 
                        type="text" 
                        placeholder="First name" 
                        value={firstName}
                        onChange={(e) => onFirstNameChange?.(e.target.value)}
                        required
                        className="w-full bg-transparent text-sm p-3.5 rounded-xl focus:outline-none animate-element animate-delay-300" 
                      />
                    </GlassInputWrapper>
                    <GlassInputWrapper className="flex-1">
                      <input 
                        name="lastName" 
                        type="text" 
                        placeholder="Last name" 
                        value={lastName}
                        onChange={(e) => onLastNameChange?.(e.target.value)}
                        required
                        className="w-full bg-transparent text-sm p-3.5 rounded-xl focus:outline-none animate-element animate-delay-300" 
                      />
                    </GlassInputWrapper>
                  </div>
                </div>
              )}

              <div className={`animate-element ${!isLogin ? 'animate-delay-400' : 'animate-delay-300'} space-y-2`}>
                <label className={`text-xs font-medium text-[var(--muted-foreground)] block animate-element ${!isLogin ? 'animate-delay-400' : 'animate-delay-300'}`}>Email Address</label>
                <GlassInputWrapper>
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="Enter your email address" 
                    value={email}
                    onChange={(e) => onEmailChange?.(e.target.value)}
                    required
                    className={`w-full bg-transparent text-sm p-3.5 rounded-xl focus:outline-none animate-element ${!isLogin ? 'animate-delay-400' : 'animate-delay-300'}`}
                  />
                </GlassInputWrapper>
              </div>

              <div className={`animate-element ${!isLogin ? 'animate-delay-500' : 'animate-delay-400'} space-y-2`}>
                <label className={`text-xs font-medium text-[var(--muted-foreground)] block animate-element ${!isLogin ? 'animate-delay-500' : 'animate-delay-400'}`}>
                  Password {!isLogin && <span className="text-xs text-[var(--muted-foreground)]/70 font-normal">(min 8 characters)</span>}
                </label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input 
                      name="password" 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Enter your password" 
                      value={password}
                      onChange={(e) => onPasswordChange?.(e.target.value)}
                      required
                      minLength={isLogin ? undefined : 8}
                      className={`w-full bg-transparent text-sm p-3.5 pr-10 rounded-xl focus:outline-none animate-element ${!isLogin ? 'animate-delay-500' : 'animate-delay-400'}`}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors" /> : <Eye className="w-4 h-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              {!isLogin && (
                <div className="animate-element animate-delay-600 space-y-2">
                  <label className="text-xs font-medium text-[var(--muted-foreground)] block animate-element animate-delay-600">
                    Role
                  </label>
                  <GlassInputWrapper>
                    <select 
                      name="role" 
                      value={role}
                      onChange={(e) => onRoleChange?.(e.target.value as "admin" | "employee")}
                      required
                      className="w-full bg-transparent text-sm p-3.5 rounded-xl focus:outline-none animate-element animate-delay-600"
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                  </GlassInputWrapper>
                </div>
              )}

              {isLogin && (
                <div className="animate-element animate-delay-500 flex items-center justify-between text-sm pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="rememberMe" className="custom-checkbox" />
                    <span className="text-[var(--foreground)]/90 text-sm">Keep me signed in</span>
                  </label>
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); onResetPassword?.(); }} 
                    className="hover:underline text-yellow-400 transition-colors text-sm"
                  >
                    Reset password
                  </a>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className={`animate-element ${!isLogin ? 'animate-delay-700' : 'animate-delay-600'} w-full rounded-xl bg-yellow-400 py-3 text-sm font-medium text-gray-900 hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2`}
              >
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <div className={`animate-element ${!isLogin ? 'animate-delay-800' : 'animate-delay-700'} relative flex items-center justify-center my-4`}>
              <span className="w-full border-t border-[var(--border)]"></span>
              <span className="px-3 text-xs text-[var(--muted-foreground)] bg-[var(--background)] absolute">Or continue with</span>
            </div>

            <button 
              onClick={onGoogleSignIn} 
              className={`animate-element ${!isLogin ? 'animate-delay-900' : 'animate-delay-800'} w-full flex items-center justify-center gap-2 border border-[var(--border)] rounded-xl py-3 text-sm hover:bg-[var(--secondary)] transition-colors`}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <p className={`animate-element ${!isLogin ? 'animate-delay-1000' : 'animate-delay-900'} text-center text-xs text-[var(--muted-foreground)] mt-2`}>
              {isLogin ? (
                <>New to our platform? <a href="#" onClick={(e) => { e.preventDefault(); onCreateAccount?.(); }} className="text-yellow-400 hover:underline transition-colors">Create Account</a></>
              ) : (
                <>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin?.(); }} className="text-yellow-400 hover:underline transition-colors">Sign In</a></>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Right column: hero image */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4">
          <div className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${heroImageSrc})` }}></div>
        </section>
      )}
    </div>
  );
};

