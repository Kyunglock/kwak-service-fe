import { Activity } from "lucide-react";
import { Card } from "@/app/components/ui/layout/card";
import { Badge } from "@/app/components/ui/feedback/badge";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const SENTIMENT_TREND = [
  { date: "01/27", bullish: 52, neutral: 31, bearish: 17 },
  { date: "01/28", bullish: 48, neutral: 33, bearish: 19 },
  { date: "01/29", bullish: 55, neutral: 29, bearish: 16 },
  { date: "01/30", bullish: 60, neutral: 27, bearish: 13 },
  { date: "01/31", bullish: 58, neutral: 28, bearish: 14 },
  { date: "02/01", bullish: 63, neutral: 25, bearish: 12 },
  { date: "02/03", bullish: 65, neutral: 23, bearish: 12 },
];

export function SentimentTrendCard() {
  return (
    <Card className="p-4 bg-slate-700 border-slate-600">
      <h3 className="font-semibold text-sm mb-4 flex items-center gap-2 text-gray-100">
        <Activity className="w-4 h-4 text-green-400" />
        시장 심리 트렌드
        <Badge className="ml-auto bg-indigo-600/80 text-white text-[10px]">임시 데이터</Badge>
      </h3>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={SENTIMENT_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#cbd5e1" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#cbd5e1" }} unit="%" />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                backgroundColor: "#334155",
                border: "1px solid #475569",
                color: "#F1F5F9",
              }}
              formatter={(value: number) => [`${value}%`]}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: "#cbd5e1" }} />
            <Line type="monotone" dataKey="bullish" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="낙관" />
            <Line type="monotone" dataKey="neutral" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="중립" />
            <Line type="monotone" dataKey="bearish" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="비관" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
