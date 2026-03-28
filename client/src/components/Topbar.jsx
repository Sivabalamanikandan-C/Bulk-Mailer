import { useNavigate } from "react-router-dom";

function Topbar() {

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <div className="bg-white shadow p-4 flex justify-between">

      <h2 className="font-semibold text-lg">
        Dashboard
      </h2>

      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-1 rounded"
      >
        Logout
      </button>

    </div>
  );
}

export default Topbar;