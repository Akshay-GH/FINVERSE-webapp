import { useState } from "react";
import { useNavigate ,Link} from "react-router-dom";
import { Lodder } from "../Components/Lodder";


export function SignupPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [errorBody, setErrorBody] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
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
    setLoading(true);
    setErrorBody("");



    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/users/signup`,
        {
          method: "POST",
          body: JSON.stringify(formData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      
      if (!response.ok) {
        setErrorBody(data.message || "Failed to create account");
        setLoading(false);
        return;
      }

      navigate("/signin");
    } catch (error) {
      setErrorBody("Network error, Please try again later");
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
              <h1 className="text-2xl font-bold"> Sign Up</h1>
              <p className="text-lg text-center">
                Enter your information to create an account
              </p>
            </div>

            <div className="flex flex flex-col m-4 p-4 gap-3">
              <div>
                <p className="font-bold">First Name</p>
                <input
                  className="w-full py-2 border-2 border-black rounded-lg "
                  type="text"
                  placeholder="first name  "
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                ></input>
              </div>

              <div>
                <p className="font-bold">Last Name</p>
                <input
                  className="  w-full py-2 border-2 border-black rounded-lg "
                  type="text"
                  placeholder="last name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                ></input>
              </div>

              <div>
                <p className="font-bold">Username</p>
                <input
                  className="  w-full py-2 border-2 border-black rounded-lg "
                  type="text"
                  placeholder="john@gmail.com"
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
              <button
                className="w-full bg-black border border-black text-white py-2 rounded disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                Sign Up
              </button>
              {loading && <Lodder></Lodder>
              }
              <p className="text-md">
               
                Already have an account?
                <Link to="/signin" className="text-blue-500">
                  Sign In
                </Link>
              </p>
              <p className="text-red-500">{errorBody}</p>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
