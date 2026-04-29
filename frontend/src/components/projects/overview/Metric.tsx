
import { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: string | number;
  delta?: ReactNode;
  deltaClassName?: string;
  valueClassName?: string;
};

export default function MetricCard({
  label,
  value,
  delta,
  deltaClassName = "text-green-600",
  valueClassName = "text-[#111318] dark:text-white",
}: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-[#1a202c] p-5 rounded-xl shadow-sm border border-[#e5e7eb] dark:border-gray-700">
      <div className="text-xs font-semibold text-[#616e89] uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${valueClassName}`}>{value}</span>
        {typeof delta === "string" || typeof delta === "number" ? (
          <span className={`text-xs font-bold ${deltaClassName}`}>{delta}</span>) : (delta ?? null)
        }
      </div>
    </div>
  );
}