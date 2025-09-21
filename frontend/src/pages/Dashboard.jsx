


import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { LogOut } from "lucide-react";
import { UserComponent } from "../Components/UserComponent";

export function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [filter, setFilter] = useState("");
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token")?.split(" ")[1];

  const fullName = useMemo(() => {
    if (!token) return "";
    try {
      const { firstName, lastName } = jwtDecode(token);
      return `${firstName} ${lastName}`;
    } catch (e) {
      console.error("Invalid token:", e);
      return "";
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Fetch balance
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/accounts/balance`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setBalance(data.balance))
      .catch((err) => console.log(err));
  }, []);

  // Fetch users
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/bulk/?filter=${filter}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.log(err));
  }, [filter]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <div className="flex justify-between items-center border p-4 font-bold relative">
        <h1 className="font-bold text-2xl">Payment App</h1>

        {/* Profile + Logout */}
        <div className="flex gap-4 items-center relative">
          <p>Hello, {fullName}</p>
          <div
            className="flex items-center justify-center h-10 w-10 rounded-full border border-solid bg-gray-200 cursor-pointer"
            onClick={() => setOpen(!open)}
          >
            {fullName[0]?.toUpperCase()}
          </div>

          {/* Logout button (animated) */}
          <div
            className={`absolute top-16 right-0 transform transition-all duration-300 ${
              open
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* BALANCE */}
      <p className="pl-4 text-lg font-bold">Your Balance ${balance}</p>
      <p className="pl-4 text-lg font-bold">Users</p>

      {/* SEARCH */}
      <input
        className="border border-gray rounded-lg m-4 p-2 w-full"
        type="text"
        placeholder="Search users..."
        onChange={(e) => setFilter(e.target.value)}
      />

      {/* USERS */}
      {users.map((user, index) => (
        <UserComponent
          key={index}
          name={`${user.firstName} ${user.lastName}`}
          Id={user.userId}
        />
      ))}
    </div>
  );
}
