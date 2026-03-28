import { useEffect, useState } from "react";
import API from "../api.js";
import DashboardLayout from "../components/DashboardLayout";
import { Link } from "react-router-dom";

function ScheduledCampaigns() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/api/campaign/scheduled");
        setHistory(res.data);
      } catch (err) {
        console.error('Failed to fetch scheduled campaigns:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">
        Scheduled Campaigns
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow rounded">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Scheduled</th>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3 text-right">Emails</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map((campaign) => (
              <tr key={campaign._id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                    SCHEDULED
                  </span>
                </td>
                <td className="p-3">
                  {new Date(campaign.scheduledAt).toLocaleString()}
                </td>
                <td className="p-3 font-medium max-w-md truncate" title={campaign.subject}>
                  {campaign.subject}
                </td>
                <td className="p-3 text-right">
                  {campaign.totalEmails}
                </td>
                <td className="p-3">
                  <div className="flex gap-2 justify-center">
                    <button 
                      onClick={async () => {
                        if (confirm('Send this campaign now?')) {
                          try {
                            await API.patch(`/api/mail/${campaign._id}/retry`);
                            alert('Campaign processing started!');
                            window.location.reload();
                          } catch (err) {
                            alert('Failed to start: ' + (err.response?.data?.message || err.message));
                          }
                        }
                      }}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                    >
                      Send Now
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm('Permanently delete this campaign?')) {
                          const campaignId = campaign._id;
                          try {
                            await API.delete(`/api/mail/${campaignId}`);
                            // Optimistic UI update: remove from list
                            setHistory(prev => prev.filter(c => c._id !== campaignId));
                          } catch (err) {
                            alert('Delete failed: ' + (err.response?.data?.message || err.message));
                          }
                        }
                      }}
                      className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No scheduled campaigns. <Link to="/bulk-mail" className="text-indigo-600 hover:underline">Schedule one now!</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default ScheduledCampaigns;
