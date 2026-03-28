import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout({ children }) {

  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1">

        <Topbar />

        <div className="p-6 bg-gray-200 min-h-screen">
          {children}
        </div>

      </div>

    </div>
  );
}

export default DashboardLayout;