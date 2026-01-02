"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Target, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  onboardingSchema,
  type OnboardingInput,
  COMPANY_SIZE_OPTIONS,
  COMP_BAND_OPTIONS,
  RISK_TOLERANCE_OPTIONS,
  LEVEL_OPTIONS,
} from "@/lib/validators/onboarding";
import { toast } from "@/components/ui/use-toast";

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldUpgrade = searchParams.get("upgrade") === "true";

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      risk_tolerance: 3,
    },
  });

  const onSubmit = async (data: OnboardingInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save profile");
      }

      toast({
        title: "Profile saved!",
        description: "You're ready to start practicing.",
      });

      if (shouldUpgrade) {
        router.push("/upgrade");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Target className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Tell us about yourself</h1>
        <p className="text-gray-600">
          This helps us personalize your scenarios and playbooks.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name and Role */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  {...register("full_name")}
                  placeholder="Jane Smith"
                />
                {errors.full_name && (
                  <p className="text-sm text-red-500">{errors.full_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role/Title *</Label>
                <Input
                  id="role"
                  {...register("role")}
                  placeholder="Product Manager"
                />
                {errors.role && (
                  <p className="text-sm text-red-500">{errors.role.message}</p>
                )}
              </div>
            </div>

            {/* Level and Industry */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Level</Label>
                <Select onValueChange={(value) => setValue("level", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  {...register("industry")}
                  placeholder="Technology"
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location_country">Country</Label>
                <Input
                  id="location_country"
                  {...register("location_country")}
                  placeholder="US"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location_region">State/Region</Label>
                <Input
                  id="location_region"
                  {...register("location_region")}
                  placeholder="CA"
                />
              </div>
            </div>

            {/* Company Size and Comp Band */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Size</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("company_size", value as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_SIZE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Compensation Band</Label>
                <Select
                  onValueChange={(value) => setValue("comp_band", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMP_BAND_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Risk Tolerance */}
            <div className="space-y-2">
              <Label>Negotiation Style</Label>
              <p className="text-sm text-gray-500 mb-2">
                How assertive are you comfortable being in negotiations?
              </p>
              <Select
                defaultValue="3"
                onValueChange={(value) =>
                  setValue("risk_tolerance", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RISK_TOLERANCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Continue"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
