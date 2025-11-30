"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { useData } from "@/lib/context/data-context"
import { PageLayout } from "@/components/layout/page-layout"
import { AirbnbCard } from "@/components/ui/airbnb-card"
import { AirbnbButton } from "@/components/ui/airbnb-button"
import { ChartCard } from "@/components/admin/chart-card"
import { DollarSign, TrendingUp, Clock, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function TutorEarningsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { earnings, transactions } = useData()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "tutor")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const stats = [
    { label: "Total Earnings", value: `₱${earnings.totalEarnings.toLocaleString()}`, icon: DollarSign },
    { label: "This Month", value: `₱${earnings.thisMonth.toLocaleString()}`, icon: TrendingUp, change: 12 },
    { label: "Pending", value: `₱${earnings.pending}`, icon: Clock },
    { label: "Avg per Session", value: `₱${earnings.averagePerSession}`, icon: CreditCard },
  ]

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Earnings</h1>
            <p className="text-muted-foreground mt-1">Track your income and payouts</p>
          </div>
          <AirbnbButton>Request Payout</AirbnbButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <AirbnbCard key={i}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </AirbnbCard>
          ))}
        </div>

        {/* Chart */}
        <div className="mb-8">
          <ChartCard
            title="Earnings Over Time"
            subtitle="Your monthly earnings for the past 6 months"
            data={earnings.monthlyData}
            type="bar"
            dataKey="earnings"
            xAxisKey="month"
          />
        </div>

        {/* Transactions */}
        <AirbnbCard>
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          <div className="divide-y divide-border">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "p-2 rounded-full",
                      transaction.type === "payment" ? "bg-success/10" : "bg-primary/10",
                    )}
                  >
                    {transaction.type === "payment" ? (
                      <ArrowDownRight className="h-5 w-5 text-success" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("font-semibold", transaction.type === "payment" ? "text-success" : "")}>
                    {transaction.type === "payment" ? "+" : "-"}₱{transaction.amount.toFixed(2)}
                  </p>
                  <p
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full inline-block",
                      transaction.status === "completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning",
                    )}
                  >
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </AirbnbCard>
      </div>
    </PageLayout>
  )
}
