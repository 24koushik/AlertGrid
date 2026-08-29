import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { AlertGridLogo } from "../../components/layout/AlertGridLogo";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err: any) {
      const dbError = err.response?.data?.error || "";
      const msg = err.response?.data?.message;
      if (
        dbError.includes("Prisma") ||
        dbError.includes("database") ||
        dbError.includes("connect")
      ) {
        setError(
          "Database connection failed. Ensure PostgreSQL is running on port 5432.",
        );
      } else {
        setError(msg || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setError("");
    setLoading(true);
    setEmail(demoEmail);
    setPassword("demo123");
    try {
      const res = await api.post("/auth/login", {
        email: demoEmail,
        password: "demo123",
      });
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Demo Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full items-center justify-center bg-background p-4 py-12">
      <div className="w-full max-w-md rounded-lg bg-card border border-border shadow-sm p-8">
        <div className="flex justify-center mb-2">
          <AlertGridLogo className="text-4xl" />
        </div>
        <p className="mb-8 text-center text-sm font-medium text-slate-500 uppercase tracking-widest">
          Real-Time Disaster Intelligence & Response
        </p>
        <h2 className="mb-6 text-center text-xl font-semibold">Sign In</h2>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded border border-input bg-background p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded border border-input bg-background p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-brand-indigo text-white font-medium hover:bg-brand-indigo/90 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-brand-indigo hover:underline">
            Register
          </Link>
        </p>
      </div>

      {/* DEMO ACCESS */}
      <div className="w-full max-w-md rounded-lg bg-card border border-border shadow-sm p-8 mt-6 border-t-4 border-brand-indigo">
        <h3 className="text-center text-lg font-bold text-foreground mb-2 uppercase tracking-wide">
          DEMO ACCESS
        </h3>
        <p className="text-center text-sm text-slate-500 mb-6">
          Explore AlertGrid using prepared presentation accounts. These are
          isolated from normal user accounts.
        </p>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full border-brand-aqua/30 hover:bg-brand-aqua/10 text-brand-aqua font-semibold"
            disabled={loading}
            onClick={() => handleDemoLogin("demo-citizen@alertgrid.demo")}
          >
            Explore Citizen Portal
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full border-brand-teal/30 hover:bg-brand-teal/10 text-brand-teal font-semibold"
            disabled={loading}
            onClick={() => handleDemoLogin("demo-volunteer@alertgrid.demo")}
          >
            Explore Volunteer Portal
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full border-brand-deep/30 hover:bg-brand-deep/10 text-brand-deep font-semibold"
            disabled={loading}
            onClick={() => handleDemoLogin("demo-admin@alertgrid.demo")}
          >
            Explore Admin Command Center
          </Button>
        </div>
      </div>
    </div>
  );
}
