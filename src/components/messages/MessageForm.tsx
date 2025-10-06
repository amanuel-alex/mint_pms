"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MessageFormProps {
  managers: Array<{
    id: string;
    fullName: string;
    email: string;
  }>;
  onSubmit: (data: { content: string; recipientId: string }) => Promise<void>;
}

export function MessageForm({ managers, onSubmit }: MessageFormProps) {
  const [content, setContent] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !recipientId) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        content,
        recipientId,
      });
      setContent("");
      setRecipientId("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Message</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your message here..."
          required
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Send to Manager
        </label>
        <Select value={recipientId} onValueChange={setRecipientId}>
          <SelectTrigger>
            <SelectValue placeholder="Select manager" />
          </SelectTrigger>
          <SelectContent>
            {managers.map((manager) => (
              <SelectItem key={manager.id} value={manager.id}>
                {manager.fullName} ({manager.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
