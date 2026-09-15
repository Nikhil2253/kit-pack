"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form);
      router.push("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Create Account</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value
            })
          }
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value
            })
          }
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value
            })
          }
          required
        />

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
    </main>
  );
}