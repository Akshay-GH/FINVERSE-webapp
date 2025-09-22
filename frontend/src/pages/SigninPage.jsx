import { useState } from "react";
import { useNavigate ,Link } from "react-router-dom";
import { Lodder } from "../Components/Lodder";
export function SigninPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [error,setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
   

    try {
      const response = await fetch(
        `https://finverse-webapp.onrender.com/api/v1/users/login`,
        {
          method: "POST",
          body: JSON.stringify(formData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
    
      if(!response.ok){
        setError(data.error || "Unable to login ")
        setLoading(false);
        return;
         }

     

       if (data.token) {
      localStorage.setItem("token", data.token);
    }

      navigate("/dashboard");

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>


    <form onSubmit={handleSubmit}>
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-500">
      <div className="w-96 h-auto gap-4 m-4 p-4 border-2 border-black rounded-lg bg-white ">
        <div className="flex flex-col items-center  gap-4">
          <h1 className="text-2xl font-bold"> Sign In</h1>
          <p className="text-lg text-center">
            Enter your Credentials to access your account
          </p>
        </div>

        <div className="flex flex flex-col m-4 p-4 gap-3">
          <div>
            <p className="font-bold">username</p>
            <input
              className="w-full py-2 border-2 border-black rounded-lg "
              type="text"
              placeholder="username"
              name="username"
              value={formData.username}
              onChange={handleChange}

            ></input>
          </div>

          <div>
            <p className="font-bold">Password</p>
            <input
              className="  w-full py-2 border-2 border-black rounded-lg "
              type="Password"
              placeholder="password"
               name="password"
              value={formData.password}
              onChange={handleChange}
            ></input>
          </div>
        </div>
        <div className="flex flex-col items-center m-4 p-4 gap-4">
          <button className="w-full bg-black border border-black text-white py-2 rounded" type ="submit" disabled={loading}>
           Sign In
          </button>
          {loading && <Lodder></Lodder>}
          <p className="text-md"> Don't have an account? <Link to="/" className="text-blue-500">Sign Up</Link></p>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    </div>
    </form>
    </>
  );
}
