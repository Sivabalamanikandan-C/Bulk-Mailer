import { useEffect, useState, useCallback } from "react";
import API from "../api";
import DashboardLayout from "../components/DashboardLayout";
import EmailChart from "../components/EmailChart";

function Dashboard() {
  const [stats, setStats] = useState({
    lifetimeTotal: 0,
    emailsToday: 0,
    failedEmails: 0,
    thisWeekTotal: 0,
    scheduledCount: 0,
    pendingCount: 0
  });
  const [campaigns, setCampaigns] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/api/dashboard/stats");
      setStats({
        ...res.data.stats,
        totalEmails: res.data.stats.lifetimeTotal || 0
      });
      setCampaigns(res.data.recentCampaigns || []);
      setWeeklyData(res.data.weeklyStats || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>
        <button
          onClick={handleRefresh}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white shadow p-6 rounded text-center">
          <h3 className="text-gray-500 text-sm uppercase tracking-wide">Lifetime Total</h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.lifetimeTotal?.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-white shadow p-6 rounded text-center">
          <h3 className="text-gray-500 text-sm uppercase tracking-wide">Emails Today (24h)</h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats.emailsToday?.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-white shadow p-6 rounded text-center">
          <h3 className="text-gray-500 text-sm uppercase tracking-wide">This Week</h3>
          <p className="text-3xl font-bold text-green-600">
            {stats.thisWeekTotal?.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-white shadow p-6 rounded text-center">
          <h3 className="text-gray-500 text-sm uppercase tracking-wide">Failed Emails</h3>
          <p className="text-3xl font-bold text-red-500">
            {stats.failedEmails?.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-white shadow p-6 rounded text-center">
          <h3 className="text-gray-500 text-sm uppercase tracking-wide">Scheduled</h3>
          <p className="text-3xl font-bold text-purple-600">
            {stats.scheduledCount || 0}
          </p>
        </div>

        <div className="bg-white shadow p-6 rounded text-center">
          <h3 className="text-gray-500 text-sm uppercase tracking-wide">Pending</h3>
          <p className="text-3xl font-bold text-orange-600">
            {stats.pendingCount || 0}
          </p>
        </div>
      </div>

      {/* WEEKLY CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4">This Week's Emails (Mon-Sun)</h2>
          <EmailChart data={weeklyData} />
        </div>

        {/* RECENT CAMPAIGNS */}
        <div className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4">
            Recent Campaigns 
            <span className="text-sm text-gray-500 ml-2">(Auto-refreshes)</span>
          </h2>

          {campaigns.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent campaigns</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-3 text-left font-medium">Date</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-left font-medium">Subject</th>
                    <th className="p-3 text-right font-medium">Emails</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign, index) => (
                    <tr key={campaign._id || index} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        {new Date(campaign.sentAt || campaign.createdAt || campaign.scheduledAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'failed' ? 'bg-red-100 text-red-800' :
                          campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {campaign.status || 'pending'}
                        </span>
                      </td>
                      <td className="p-3 truncate max-w-xs" title={campaign.subject}>
                        {campaign.subject}
                      </td>
                      <td className="p-3 text-right font-mono">
                        {campaign.totalEmails?.toLocaleString() || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;

