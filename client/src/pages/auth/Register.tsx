import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { AlertGridLogo } from "../../components/layout/AlertGridLogo";
import { Button } from "@/components/ui/button";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    location: "",
    role: "CITIZEN",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", formData);
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
        setError(msg || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg bg-card border border-border shadow-sm p-8">
        <div className="flex justify-center mb-2">
          <AlertGridLogo className="text-4xl" />
        </div>
        <p className="mb-8 text-center text-sm font-medium text-slate-500 uppercase tracking-widest">
          Real-Time Disaster Intelligence & Response
        </p>
        <h2 className="mb-6 text-center text-xl font-semibold">
          Create Account
        </h2>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-foreground">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              className="w-full rounded border border-input bg-background p-2"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              name="email"
              type="email"
              className="w-full rounded border border-input bg-background p-2"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              name="password"
              type="password"
              className="w-full rounded border border-input bg-background p-2"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-foreground">
              Role
            </label>
            <select
              name="role"
              className="w-full rounded border border-input bg-background p-2"
              onChange={handleChange}
            >
              <option value="CITIZEN">Citizen (Need Help / Information)</option>
              <option value="VOLUNTEER">Volunteer (Provide Help)</option>
            </select>
          </div>
          <Button
            type="submit"
            className="w-full bg-brand-indigo text-white font-medium hover:bg-brand-indigo/90 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-indigo hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
