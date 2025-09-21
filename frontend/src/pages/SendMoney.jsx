import { useState } from "react";
import { useParams ,useNavigate} from "react-router-dom";
import PaymentSuccessPopup from "../Components/PaymentSuccessful";

export function SendMoney() {
  const [amount, setAmount] = useState(0);
  const { to, name } = useParams();
  const [showpopUp, setPopUp] = useState(false);
  const navigate = useNavigate();

  const handleTransfer = async () => {
    // Validate amount
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/accounts/transfer`,
        {
          method: "POST",
          body: JSON.stringify({ to, amount: Number(amount) }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
    

      if (!response.ok) {
        alert(data.error || "Unable to process transaction");
        return;
      } else {
        document.getElementById("amount").value = "";
        setPopUp(() => true);
      }
    } catch (error) {
      console.error("Transfer error:", error);
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className=" flex flex-col justify-center items-center  gap-6 m-4 p-4 border-2 border-black rounded-lg bg-white  w-100 h-auto">
        <div className="text-2xl font-bold"> Send Money</div>
        <div className="flex flex-col justify-start gap-2 ">
          <div className=" flex gap-4 items-center">
            <div className="flex  items-center justify-center h-10 w-10 rounded-full border border-solid bg-green-100">
              {name[0].toUpperCase()}
            </div>
            <p className="font-bold"> {name}</p>
          </div>
          <p> Amount {"(in Rs)"}</p>
          <input
            className="border border border-gray rounded-lg"
            type="number"
            id="amount"
            placeholder="Enter Amount"
            onChange={(e) => {
              setAmount(e.target.value);
            }}
          />
          <button
            className="bg-green-500 text-white rounded-lg px-4 py-1"
            onClick={handleTransfer}
          >
            Initiate Transfer
          </button>
          {showpopUp && (
            <PaymentSuccessPopup
              amount={amount}
              onClose={() => {setPopUp(false)
                navigate("/dashboard")
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
