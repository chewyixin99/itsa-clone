import { useState } from "react";
import { useNavigate } from "react-router-dom";

const OTPVerification = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const handleInput = (e) => {
    e.preventDefault();
    if (loading) {
      // do not do anything
    } else {
      let tmpInput = JSON.parse(JSON.stringify(input));
      const idx = parseInt(e.target.id);
      const val = e.key;
      console.log(`idx is ${idx}, val is ${val}`);
      if (val === "Backspace") {
        if (idx !== 0) {
          document.getElementById(`${idx - 1}`).focus();
        }
        tmpInput[idx] = "";
      } else if (
        // 48 (inc) - 57 (inc), 96 inc - 105 inc
        (e.keyCode >= 48 && e.keyCode <= 57) ||
        (e.keyCode >= 96 && e.keyCode <= 105)
      ) {
        tmpInput[idx] = val;
        if (idx !== tmpInput.length - 1) {
          document.getElementById(`${idx + 1}`).focus();
        }
      }
      if (idx === tmpInput.length - 1 && tmpInput[idx] !== "") {
        console.log("filled");
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          navigate("/home", {
            replace: true,
          });
        }, 3000);
      }
      console.log(tmpInput);
      setInput(tmpInput);
    }
  };

  return (
    <div className="flex h-[90vh] my-auto mx-auto justify-center items-center bg-gray-50">
      <div className="border rounded-md min-w-[50vh] bg-white">
        <h2 className="p-5 bg-[#0f385c] rounded-t-md text-white">
          OTP Verification
        </h2>
        <hr />
        <div className="text-center mt-5">
          <div>Enter the OTP you received at</div>
          <div className="font-bold">+65 **** 5012</div>
        </div>
        <div className="text-center my-5">
          <input
            className="m-2 border h-10 w-10 text-center form-control rounded"
            type="text"
            value={input[0]}
            id={0}
            maxLength="1"
            onKeyDown={handleInput}
          />
          <input
            className="m-2 border h-10 w-10 text-center form-control rounded"
            type="text"
            value={input[1]}
            id={1}
            maxLength="1"
            onKeyDown={handleInput}
          />
          <input
            className="m-2 border h-10 w-10 text-center form-control rounded"
            type="text"
            value={input[2]}
            id={2}
            maxLength="1"
            onKeyDown={handleInput}
          />
          <input
            className="m-2 border h-10 w-10 text-center form-control rounded"
            type="text"
            value={input[3]}
            id={3}
            maxLength="1"
            onKeyDown={handleInput}
          />
          <input
            className="m-2 border h-10 w-10 text-center form-control rounded"
            type="text"
            value={input[4]}
            id={4}
            maxLength="1"
            onKeyDown={handleInput}
          />
          <input
            className="m-2 border h-10 w-10 text-center form-control rounded"
            type="text"
            value={input[5]}
            id={5}
            maxLength="1"
            onKeyDown={handleInput}
          />
        </div>
        <div className="mb-5 text-center">
          <button
            className={`custom-button p-3 mx-2 ${
              loading ? "bg-gray-300" : "bg-[#0f385c]"
            } text-white`}
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
