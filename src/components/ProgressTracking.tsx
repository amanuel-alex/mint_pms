"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Award } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  period: string;
  type: string;
}

export default function ProgressTracking() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const response = await fetch('/api/team-member/goals');
    if (response.ok) {
      const data = await response.json();
      setGoals(data);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Progress Goals
        </CardTitle>
        <Button size="sm" onClick={() => setShowAddGoal(true)}>
          Add Goal
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{goal.title}</span>
                <span>{goal.current}/{goal.target}</span>
              </div>
              <Progress value={(goal.current / goal.target) * 100} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 