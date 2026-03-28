import { useState } from "react";
// import axios from "axios";
import API from "../api";
import * as XLSX from "xlsx";

function BulkMail() {
const [msg, setmsg] = useState("");
  const [submsg, setSubmsg] = useState("");
  const [status, setStatus] = useState(false);
  const [emaillist, setEmaillist] = useState([]);  
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState("now"); // "now" or "schedule"
  const [scheduledAt, setScheduledAt] = useState("");

  const formatInvalidEmails = (invalidEmails = []) =>
    invalidEmails
      .map((entry) => {
        if (typeof entry === "string") {
          return entry;
        }

        if (entry?.email && entry?.reason) {
          return `${entry.email} (${entry.reason})`;
        }

        return String(entry ?? "");
      })
      .filter(Boolean)
      .join("\n");

  const handleFile = (event) => {
    const file = event.target.files[0];
    if (!file || !(file instanceof Blob)) return;

    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const emails = rows
          .flatMap(row => Object.values(row))
          .map(email => String(email).trim())
          .filter(email => email !== ""); // DO NOT filter here. Let the backend validate it!

        const uniqueEmails = [...new Set(emails)];
        setEmaillist(uniqueEmails);
      } catch (error) {
        console.error("Error reading file:", error);
        alert("Error reading the Excel file. Please make sure it's a valid .xlsx or .xls file.");
      }
    };

    reader.onerror = function () {
      alert("Error reading the file.");
    };

    reader.readAsArrayBuffer(file);
  };

  const sendCampaign = async () => {
    if (!submsg || !msg || emaillist.length === 0) {
      alert("Please fill all fields and upload file");
      return;
    }

    if (mode === "schedule" && !scheduledAt) {
      alert("Please select schedule time");
      return;
    }

    try {
      setStatus(true);
      setProgress(30);

      const payload = {
        msg,
        submsg,
        emaillist
      };

      let res;
      if (mode === "schedule") {
        payload.scheduledAt = scheduledAt;
        res = await API.post("/api/mail/schedule", payload);
      } else {
        // 🔥 USE NEW SIMPLE ROUTE
        res = await API.post("/api/send-mails", {
          emails: emaillist,
          subject: submsg,
          message: msg
        });
      }

      // ✅ ONLY SHOW SUCCESS ALERT
      if (res.data.success) {
        setProgress(100);
        const successMessage =
          res.data.message || (mode === "schedule" ? "Campaign scheduled!" : "Mail sent!");
        const warningMessage = res.data.verificationWarning
          ? `\n\nNote: ${res.data.verificationWarning}`
          : "";

        alert(`${successMessage}${warningMessage}`);
      }

    } catch (err) {
      console.error(err);

      if (err.code === 'ERR_NETWORK' || err.response?.status >= 500) {
        alert(
          '🚨 The server is not responding. Please make sure the backend server is running and try again.'
        );
        return;
      }

      const responseData = err.response?.data;
      if (responseData?.invalidEmails) {
        alert("Invalid Emails Found:\n\n" + formatInvalidEmails(responseData.invalidEmails));
        return; // MUST STOP HERE
      }

      alert(responseData?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setStatus(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-indigo-100 px-4">

      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-8">

        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          Send Bulk Mail
        </h1>

<input
          value={submsg}
          onChange={(e) => setSubmsg(e.target.value)}
          type="text"
          placeholder="Enter mail subject"
          className="border p-3 w-full mb-4 rounded-lg"
        />

        <textarea
          value={msg}
          onChange={(e) => setmsg(e.target.value)}
          placeholder="Enter mail message"
          className="border p-3 w-full mb-4 h-32 rounded-lg"
        />

        {/* Send Mode Selection */}
        <div className="flex gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <label className="flex items-center">
            <input
              type="radio"
              name="mode"
              value="now"
              checked={mode === "now"}
              onChange={(e) => setMode(e.target.value)}
              className="mr-2"
            />
            <span>Send Now</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="mode"
              value="schedule"
              checked={mode === "schedule"}
              onChange={(e) => setMode(e.target.value)}
              className="mr-2"
            />
            <span>Schedule Later</span>
          </label>
        </div>

        {/* Schedule DateTime Picker */}
        {mode === "schedule" && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Schedule for:</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date(Date.now() + 60000).toISOString().slice(0,16)} // Min 1 min from now
              className="border p-3 w-full rounded-lg"
            />
          </div>
        )}

        <div className="flex justify-center mb-3">

          <input
            type="file"
            onChange={handleFile}
            className="text-sm text-gray-500
    file:mr-4 file:py-2 file:px-4
    file:rounded-lg file:border-0
    file:text-sm file:font-semibold
    file:bg-indigo-50 file:text-indigo-700
    hover:file:bg-indigo-100 cursor-pointer"
          />

        </div>

        <p className="mb-3 font-semibold text-indigo-600 text-center">
          Total Emails: {emaillist.length}
        </p>


        {/* Excel Preview Table */}
        {emaillist.length > 0 && (
          <div className="mt-5 max-h-60 overflow-y-auto border rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">Email Address</th>
                </tr>
              </thead>

              <tbody>
                {emaillist.map((email, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4 mt-4">
            <div
              className="bg-indigo-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}


        <div className="flex justify-center">
          <button
            onClick={sendCampaign}
            disabled={status}
            className="bg-indigo-600 text-white px-8 py-3 mt-6 rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status ? "Processing..." : (mode === "schedule" ? "Schedule Campaign" : "Send Now")}
          </button>
        </div>

      </div>
    </div>
  );
}

export default BulkMail;
