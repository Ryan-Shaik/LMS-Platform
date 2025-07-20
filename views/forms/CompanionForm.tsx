"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subjects, voices } from "@/lib/utils";
import { createCompanion } from "@/controllers/CompanionController";
import { ROUTES } from "@/lib/constants";

const companionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required").max(200, "Topic too long"),
  voice: z.string().min(1, "Voice is required"),
  style: z.string().min(1, "Style is required"),
  duration: z.number().min(5, "Minimum 5 minutes").max(120, "Maximum 120 minutes"),
  instructions: z.string().optional(),
  isPublic: z.boolean().default(false),
});

type CompanionFormData = z.infer<typeof companionSchema>;

export default function CompanionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CompanionFormData>({
    resolver: zodResolver(companionSchema),
    defaultValues: {
      duration: 30,
      isPublic: false,
    },
  });

  const onSubmit = async (data: CompanionFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createCompanion(data);

      if (result.success) {
        reset();
        router.push(ROUTES.COMPANIONS);
      } else {
        setError(result.error || "Failed to create companion");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(ROUTES.COMPANIONS);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New AI Companion</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Companion Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Math Wizard Alex"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <select
                id="subject"
                {...register("subject")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject.charAt(0).toUpperCase() + subject.slice(1)}
                  </option>
                ))}
              </select>
              {errors.subject && (
                <p className="text-sm text-red-600">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                {...register("duration", { valueAsNumber: true })}
                min="5"
                max="120"
              />
              {errors.duration && (
                <p className="text-sm text-red-600">{errors.duration.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              {...register("topic")}
              placeholder="e.g., Algebra basics and problem solving"
            />
            {errors.topic && (
              <p className="text-sm text-red-600">{errors.topic.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="voice">Voice Type</Label>
              <select
                id="voice"
                {...register("voice")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select voice</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
              {errors.voice && (
                <p className="text-sm text-red-600">{errors.voice.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="style">Teaching Style</Label>
              <select
                id="style"
                {...register("style")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select style</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
              </select>
              {errors.style && (
                <p className="text-sm text-red-600">{errors.style.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Custom Instructions (Optional)</Label>
            <textarea
              id="instructions"
              {...register("instructions")}
              placeholder="Add custom instructions for your AI tutor. If left empty, instructions will be generated automatically based on your selections."
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
              rows={4}
            />
            {errors.instructions && (
              <p className="text-sm text-red-600">{errors.instructions.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Leave empty to auto-generate instructions based on your companion settings.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="isPublic"
              type="checkbox"
              {...register("isPublic")}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isPublic" className="text-sm">
              Make this companion public for others to use
            </Label>
          </div>

          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Creating..." : "Create Companion"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}