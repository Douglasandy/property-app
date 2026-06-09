"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LineChart as LineChartIcon } from "lucide-react";
import { ReportCard } from "./report-card";
import { formatCompactCurrency } from "@/lib/formatters";
import type { PriceTrend } from "@/types/property";

interface PriceTrendCardProps {
  data: PriceTrend;
}

export function PriceTrendCard({ data }: PriceTrendCardProps) {
  return (
    <ReportCard
      title="Price Trend"
      icon={<LineChartIcon className="size-4" />}
      dataSourceMeta={data.dataSourceMeta}
    >
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.data}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatCompactCurrency(v)}
            />
            <Tooltip
              formatter={(value) =>
                formatCompactCurrency(Number(value ?? 0))
              }
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                fontSize: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="area"
              name="This Area"
              stroke="#5d3fd3"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "#5d3fd3" }}
            />
            <Line
              type="monotone"
              dataKey="niAverage"
              name="NI Average"
              stroke="#9ca3af"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4, fill: "#9ca3af" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">This Area</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border-2 border-dashed border-muted-foreground" />
          <span className="text-xs text-muted-foreground">NI Average</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/60 pt-4">
        <div>
          <p className="text-xs text-muted-foreground">Area growth</p>
          <p className="mt-0.5 text-sm font-bold text-success">
            +{data.areaGrowthPercent}%
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">NI average</p>
          <p className="mt-0.5 text-sm font-bold text-success">
            +{data.niAverageGrowthPercent}%
          </p>
        </div>
      </div>
    </ReportCard>
  );
}
