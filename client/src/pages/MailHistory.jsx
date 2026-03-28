import { useEffect, useState } from "react";
// import axios from "axios";
import API from "../api";
import DashboardLayout from "../components/DashboardLayout";

function MailHistory() {

  const [history, setHistory] = useState([]);

  useEffect(() => {
      const fetchData = async () => {
      const res = await API.get("/api/campaign/sent");
      setHistory(res.data);
    };
    fetchData();
  }, []);

  return (

    <DashboardLayout>

        <h1 className="text-2xl font-bold mb-6">
        Sent Campaigns
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow rounded">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3 text-right">Emails</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map((campaign) => {
              const statusColor = campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                                campaign.status === 'partial' ? 'bg-orange-100 text-orange-800' :
                                campaign.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                campaign.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800';
              const isActionable = ['pending', 'scheduled', 'failed'].includes(campaign.status);
              return (
                <tr key={campaign._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                      {campaign.status?.toUpperCase() || 'SENT'}
                    </span>
                  </td>
                  <td className="p-3">
                    {campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleString() : 
                     new Date(campaign.sentAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 font-medium max-w-md truncate" title={campaign.subject}>
                    {campaign.subject}
                  </td>
                  <td className="p-3 text-right">
                    {campaign.totalEmails} {campaign.results && 
                      <span className="text-sm text-gray-500">
                        ({campaign.results.filter(r => r.status === 'success').length} success)
                      </span>}
                  </td>
                  <td className="p-3">
                    {isActionable && (
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={async () => {
                            if (confirm('Retry this campaign?')) {
                              try {
                                await API.patch(`/api/mail/${campaign._id}/retry`);
                                alert('Retry started!');
                                // Refresh
                                window.location.reload();
                              } catch (err) {
                                alert('Retry failed: ' + err.response?.data?.message);
                              }
                            }
                          }}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          Retry
                        </button>
                        <button 
                          onClick={async () => {
                            if (confirm('Permanently delete this campaign?')) {
                              const campaignId = campaign._id;
                              try {
                                await API.delete(`/api/mail/${campaignId}`);
                                // Optimistic UI update
                                setHistory(prev => prev.filter(c => c._id !== campaignId));
                              } catch (err) {
                                alert('Delete failed: ' + err.response?.data?.message);
                              }
                            }
                          }}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {history.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No campaigns yet. <a href="/dashboard/bulkmail" className="text-indigo-600 hover:underline">Send your first one!</a>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </DashboardLayout>

  );

}

export default MailHistory;