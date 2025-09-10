import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

const checkStrengthSchema = z.object({
  password: z.string(),
});

interface PasswordStrength {
  score: number;
  errors: string[];
  suggestions: string[];
}

function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const errors: string[] = [];
  const suggestions: string[] = [];

  // Length check
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
    suggestions.push("Increase password length");
  } else if (password.length >= 8) {
    score += 1;
  }

  // Contains lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push("Missing lowercase letters");
    suggestions.push("Add lowercase letters");
  } else {
    score += 1;
  }

  // Contains uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push("Missing uppercase letters");
    suggestions.push("Add uppercase letters");
  } else {
    score += 1;
  }

  // Contains numbers
  if (!/\d/.test(password)) {
    errors.push("Missing numbers");
    suggestions.push("Add numbers");
  } else {
    score += 1;
  }

  // Contains special characters
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Missing special characters");
    suggestions.push("Add special characters like !@#$%^&*");
  } else {
    score += 1;
  }

  // Length bonus
  if (password.length >= 12) {
    score += 1;
  }

  // Ensure score is between 0-4
  score = Math.min(4, Math.max(0, score - 1));

  return {
    score,
    errors,
    suggestions,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = checkStrengthSchema.parse(body);

    const strength = checkPasswordStrength(password);

    return NextResponse.json(strength);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    console.error("Password strength check error:", error);
    return NextResponse.json(
      { error: "Password strength check failed" },
      { status: 500 }
    );
  }
}