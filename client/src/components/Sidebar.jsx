import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 bg-indigo-600 text-white min-h-screen p-6">

      <h1 className="text-2xl font-bold mb-10">
        Bulk Mailer
      </h1>

      <ul className="space-y-4">

        <li>
          <Link
            to="/dashboard"
            className="block hover:bg-indigo-700 p-2 rounded"
          >
            Dashboard
          </Link>
        </li>

        <li>
          <Link
            to="/bulk-mail"
            className="block hover:bg-indigo-700 p-2 rounded"
          >
            Send Mail
          </Link>
        </li>

        <li>
          <Link
            to="/history"
            className="block hover:bg-indigo-700 p-2 rounded"
          >
            Sent Campaigns
          </Link>
        </li>
        <li>
          <Link
            to="/scheduled"
            className="block hover:bg-indigo-700 p-2 rounded"
          >
            Scheduled Campaigns
          </Link>
        </li>

      </ul>
    </div>
  );
}

export default Sidebar;