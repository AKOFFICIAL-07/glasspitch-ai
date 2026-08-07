import { BackgroundFX } from "@/components/background";
import { Brand, BrandMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail, UserX } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      setError(
        `Failed to sign in as guest: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <BackgroundFX particleCount={50} />

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-4xl items-stretch gap-6 lg:grid-cols-[1fr_1.05fr]">
          {/* Pitch panel */}
          <div className="glass relative hidden flex-col justify-between overflow-hidden rounded-3xl p-8 lg:flex">
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                background:
                  "linear-gradient(140deg, rgba(34,211,238,0.3), rgba(99,102,241,0.25), rgba(168,85,247,0.3))",
              }}
            />
            <div className="relative">
              <Brand />
              <h2 className="mt-8 text-3xl font-bold leading-tight tracking-tight text-slate-100">
                Your hackathon repo deserves a{" "}
                <span className="text-gradient">serious deck.</span>
              </h2>
              <ul className="mt-7 space-y-3.5">
                {[
                  "Six story sections extracted from your docs",
                  "Floating glass cards that build your narrative",
                  "Present, export as PDF, publish to the catalog",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] text-slate-300">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 text-[10px] font-bold text-white">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <p className="relative text-[12.5px] leading-relaxed text-slate-500">
              Free to start — your first deck is one paste away. No design
              skills, no template hunting, no 3 a.m. panic before demo day.
            </p>
          </div>

          {/* Auth card */}
          <div className="glass-strong w-full">
            {step === "signIn" ? (
              <>
                <CardHeader className="text-center">
                  <div className="flex justify-center">
                    <BrandMark className="mt-2 h-14 w-14" />
                  </div>
                  <CardTitle className="mt-3 text-2xl tracking-tight text-slate-100">
                    Get started with Pitch Forge
                  </CardTitle>
                  <CardDescription className="text-[13.5px]">
                    Enter your email to log in or sign up — or continue as guest
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleEmailSubmit}>
                  <CardContent className="px-7">
                    <div className="relative flex items-center gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <Input
                          name="email"
                          placeholder="name@example.com"
                          type="email"
                          className="h-11 rounded-xl border-white/10 bg-white/5 pl-10 text-[14px] shadow-inner backdrop-blur-md focus-visible:border-cyan-400/40 focus-visible:ring-cyan-400/20"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="outline"
                        size="icon"
                        disabled={isLoading}
                        className="glass-soft h-11 w-11 rounded-xl text-cyan-300 hover:bg-white/10"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}

                    <div className="my-5">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-transparent px-2 text-slate-500">Or</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="glass-soft mt-1 h-11 w-full rounded-xl text-[14px] font-medium text-slate-300 hover:bg-white/10"
                      onClick={handleGuestLogin}
                      disabled={isLoading}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Continue as Guest
                    </Button>
                  </CardContent>
                </form>
              </>
            ) : (
              <>
                <CardHeader className="mt-4 text-center">
                  <div className="flex justify-center">
                    <BrandMark className="h-12 w-12" />
                  </div>
                  <CardTitle className="text-xl tracking-tight text-slate-100">
                    Check your email
                  </CardTitle>
                  <CardDescription className="text-[13.5px]">
                    We&apos;ve sent a code to{" "}
                    <span className="font-semibold text-slate-300">{step.email}</span>
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleOtpSubmit}>
                  <CardContent className="px-7 pb-4">
                    <input type="hidden" name="email" value={step.email} />
                    <input type="hidden" name="code" value={otp} />

                    <div className="flex justify-center">
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                        disabled={isLoading}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                            const form = (e.target as HTMLElement).closest("form");
                            if (form) form.requestSubmit();
                          }
                        }}
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className="h-12 w-10 rounded-lg border-white/10 bg-white/5 shadow-inner backdrop-blur-md"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    {error && (
                      <p className="mt-2 text-center text-sm text-rose-400">{error}</p>
                    )}
                    <p className="mt-5 text-center text-sm text-slate-500">
                      Didn&apos;t receive a code?{" "}
                      <Button
                        variant="link"
                        className="h-auto p-0 font-semibold text-cyan-300"
                        onClick={() => setStep("signIn")}
                      >
                        Try again
                      </Button>
                    </p>
                  </CardContent>
                  <CardFooter className="flex-col gap-2 px-7 pb-6">
                    <Button
                      type="submit"
                      className="h-11 w-full gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-[14px] shadow-[0_12px_28px_rgba(34,211,238,0.25)]"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify code
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep("signIn")}
                      disabled={isLoading}
                      className="w-full text-[13px] text-slate-400 hover:bg-white/10"
                    >
                      Use different email
                    </Button>
                  </CardFooter>
                </form>
              </>
            )}

            <div className="rounded-b-3xl border-t border-white/10 bg-white/5 px-6 py-4 text-center text-xs text-slate-500">
              Secured by{" "}
              <a
                href="https://freebuff.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-400 underline-offset-2 hover:underline"
              >
                freebuff.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
