import { useNavigate } from "react-router-dom";

export function UserComponent({ name, Id }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/send/${Id}/${name}`);
  };
  return (
    <div className="flex justify-between p-4">
      <div className=" flex gap-4 items-center">
        <div className="flex items-center justify-center h-10 w-10 rounded-full border border-solid bg-green-500">
          {name[0].toUpperCase()}
        </div>
        <p>{name}</p>
      </div>
      <button className="text-white text-center bg-green-500 border border-solid  rounded-lg p-2" onClick={handleClick}>
        Send Money
      </button>
    </div>
  );
}
