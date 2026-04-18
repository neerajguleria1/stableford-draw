"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  score: z
    .number({ invalid_type_error: "Score is required" })
    .int()
    .min(1, "Score must be at least 1")
    .max(45, "Score must be at most 45"),
  played_at: z
    .string()
    .min(1, "Date is required")
    .refine((d) => !isNaN(Date.parse(d)), "Invalid date")
    .refine((d) => new Date(d) <= new Date(), "Date cannot be in the future"),
});

export type ScoreFormData = z.infer<typeof schema>;

interface ScoreFormProps {
  onSubmit: (data: ScoreFormData) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export function ScoreForm({ onSubmit, loading, error }: ScoreFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScoreFormData>({
    resolver: zodResolver(schema),
  });

  async function handleFormSubmit(data: ScoreFormData) {
    await onSubmit(data);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Score <span className="text-muted-foreground">(1–45)</span>
        </label>
        <input
          type="number"
          min={1}
          max={45}
          {...register("score", { valueAsNumber: true })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
          placeholder="Enter your score"
        />
        {errors.score && (
          <p className="text-red-400 text-sm mt-1">{errors.score.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Date Played</label>
        <input
          type="date"
          max={new Date().toISOString().split("T")[0]}
          {...register("played_at")}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
        />
        {errors.played_at && (
          <p className="text-red-400 text-sm mt-1">{errors.played_at.message}</p>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Submit Score"}
      </button>
    </form>
  );
}
