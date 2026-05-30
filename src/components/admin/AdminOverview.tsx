"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface AdminOverviewProps {
  userCount: number;
  activePromos: number;
  verifiedCount: number;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ userCount, activePromos, verifiedCount }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-secondary/20 border-white/5 rounded-[2rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-widest">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{userCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/20 border-white/5 rounded-[2rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-widest">Active Promos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{activePromos}</div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/20 border-white/5 rounded-[2rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-widest">Verified Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{verifiedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-secondary/20 border-white/5 rounded-[2.5rem]">
        <CardHeader>
          <CardTitle className="text-xl font-black">System Status</CardTitle>
          <CardDescription>Real-time platform health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-background/30 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">Database Connection</p>
                <p className="text-xs text-muted-foreground">Supabase services are operational</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;