"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function EmailVerifiedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <div className="mb-6">
          <Image
            src="/logo.png"
            alt="MinT Logo"
            width={80}
            height={80}
            className="mx-auto"
          />
        </div>
        
        <div className="mb-6">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Email Verified Successfully!
          </h1>
          <p className="text-gray-600">
            Thank you for verifying your email address. You can now access all features of the MinT system.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-block bg-[#087684] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#076573] transition-colors"
        >
          Continue to Login
        </Link>
      </div>
    </div>
  );
} 