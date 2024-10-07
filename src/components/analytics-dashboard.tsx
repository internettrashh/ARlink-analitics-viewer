import { useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dryrun } from "@permaweb/aoconnect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AnalyticsData {
  pageCounts: { [key: string]: number };
  monthlyCounts: { [key: string]: number };
  allTimeCount: number;
}

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [pid, setPid] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalytics = async () => {
    if (!pid) return;
    setIsLoading(true);
    try {
      const result = await dryrun({
        process: pid,
        data: "Analytics.GetAllCounts",
        tags: [
          { name: "Action", value: "Analytics.GetAllCounts" }
        ]
      });
      const parsedData: AnalyticsData = JSON.parse(result.Messages[0].Data);
      setAnalyticsData(parsedData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalVisitors = analyticsData?.allTimeCount || 0;
  const uniqueVisitors = Math.floor(totalVisitors * 0.7); // Placeholder: assuming 70% of total visitors are unique
  const pageViews = analyticsData ? Object.values(analyticsData.pageCounts).reduce((a, b) => a + b, 0) : 0;

  const monthlyData = analyticsData ? Object.entries(analyticsData.monthlyCounts)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => {
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return months.indexOf(a.name) - months.indexOf(b.name);
    }) : [];

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-black text-white p-8">
      <div className="w-full max-w-7xl space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">Analytics Dashboard</h1>
          <div className="flex w-full sm:w-auto space-x-2">
            <Input
              type="text"
              placeholder="Enter PID"
              value={pid}
              onChange={(e) => setPid(e.target.value)}
              className="bg-zinc-800 text-white border-zinc-700"
            />
            <Button 
              onClick={fetchAnalytics} 
              disabled={isLoading}
              className="bg-white text-black hover:bg-zinc-200"
            >
              {isLoading ? 'Loading...' : 'Fetch Analytics'}
            </Button>
          </div>
        </div>
        
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Visitors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalVisitors.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Unique Visitors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{uniqueVisitors.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Page Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{pageViews.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Avg. Visit Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">N/A</div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          <Card className="col-span-1 lg:col-span-4 bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Visitor Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={monthlyData}>
                  <XAxis
                    dataKey="name"
                    stroke="#ffffff"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#ffffff"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="col-span-1 lg:col-span-3 bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {analyticsData && Object.entries(analyticsData.pageCounts)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([page, visits], index) => (
                    <div className="flex items-center" key={index}>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-white">{page}</p>
                        <p className="text-sm text-zinc-300">{visits.toLocaleString()} visits</p>
                      </div>
                      <div className="ml-auto font-medium text-white">{index + 1}</div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}