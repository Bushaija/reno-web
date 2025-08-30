import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { columns } from "./components/columns";

// Mock data - replace with API call
const mockData = [
  {
    id: "NUR-123",
    name: "Alice Johnson",
    specialization: "ICU",
    hoursWorked: 42,
    overtime: 2,
    shifts: 5,
    patientRatio: 4.5,
    balanceScore: 85,
    status: "overworked",
  },
  {
    id: "NUR-456",
    name: "Bob Williams",
    specialization: "ER",
    hoursWorked: 35,
    overtime: 0,
    shifts: 4,
    patientRatio: 5.1,
    balanceScore: 55,
    status: "balanced",
  },
  {
    id: "NUR-789",
    name: "Charlie Brown",
    specialization: "Pediatrics",
    hoursWorked: 28,
    overtime: 0,
    shifts: 3,
    patientRatio: 6.0,
    balanceScore: 25,
    status: "underutilized",
  },
];

export default function WorkloadPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Workload Balance</h1>
        <DateRangePicker />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Avg. Hours/Week</CardTitle>
            <CardDescription>Bar Chart Placeholder</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for Bar Chart */}
            <div className="h-[200px] w-full bg-secondary rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Avg. Hours Chart</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Overtime Distribution</CardTitle>
            <CardDescription>Pie Chart Placeholder</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for Pie Chart */}
            <div className="h-[200px] w-full bg-secondary rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Overtime Chart</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Shift Distribution</CardTitle>
            <CardDescription>Stacked Bar Placeholder</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for Stacked Bar Chart */}
            <div className="h-[200px] w-full bg-secondary rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Shift Dist. Chart</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Patient Ratio Analysis</CardTitle>
            <CardDescription>Analysis Placeholder</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for Patient Ratio */}
            <div className="h-[200px] w-full bg-secondary rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Patient Ratio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workload Comparison</CardTitle>
          <CardDescription>
            Detailed workload metrics for each nurse.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={mockData} />
        </CardContent>
      </Card>
    </div>
  );
}