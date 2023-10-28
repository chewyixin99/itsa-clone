import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// To be shifted out
const BE_URL = "http://127.0.0.1:3001";

const QRVerificationSetup = () => {
  const navigate = useNavigate();
	const [qrCodeData, setQRCodeData] = useState(""); // State for QR code data
	const [enteredCode, setEnteredCode] = useState(""); // State for user-entered code
	const [isVerified, setIsVerified] = useState(false); // State for verification status
	const [errorMsg, setErrorMsg] = useState("");
	const username = localStorage.getItem("username");

	// useEffect(() => {
	// 	const qrCode = sessionStorage.getItem("QR");
	// 	setQRCodeData(qrCode);
	// }, []);

	const setupQRClick = async (e) => {
		e.preventDefault();

    const response = await axios.post(`${BE_URL}/oauth/qr`, { email: username })
    if (response.status === 200){
      setQRCodeData( response.data.qr)
    } else {
      setErrorMsg("Unable to generate QR");
    }
	};

	// Function to handle code submission
	const handleCodeSubmit = async (e) => {
    e.preventDefault();
		// Check if the entered code matches the QR code data
		if (enteredCode) {
			try {
				const response = await axios.post(`${BE_URL}/oauth/validateqr`, {
					email: username,
					code: enteredCode,
				});
				if (response.status !== 200) {
					// More general error to prevent people from hacking?
					setErrorMsg("Invalid OTP. Please try again");
					return;
				}

				localStorage.setItem("user", JSON.stringify(response.data));
				localStorage.removeItem("username");
        console.log("success?")
				navigate("../home", {
					replace: true,
				});
        
			} catch (error) {
				setErrorMsg("Invalid OTP, try again");
			}
		}
	};

	return (
		<div className="flex h-[90vh] my-auto mx-auto justify-center items-center bg-gray-50">
			<div className="border rounded-md min-w-[50vh] bg-white text-center">
				<h2 className="p-5 bg-[#0f385c] rounded-t-md text-white">
					Authenticator Code Verification
				</h2>
        <hr />
				<button className="p-3 mx-2 custom-button-primary text-white" onClick={setupQRClick}>CLICK HERE TO GENERATE A QR CODE</button>
				<div className="text-center mt-5">
					<p>Scan the QR code with Google Authenticator:</p>
					<img src={qrCodeData} alt="QR Code" />
				</div>
				<div className="text-center my-5">
					<p>Enter the code from Google Authenticator:</p>
					<input
						className="m-2 border h-10 w-32 text-center form-control rounded"
						type="text"
						value={enteredCode}
						onChange={(e) => setEnteredCode(e.target.value)}
					/>
				</div>
				<div className="text-center mb-5">
					<button
						className="p-3 mx-2 custom-button-primary text-white"
						onClick={handleCodeSubmit}
					>
						Submit Code
					</button>
				</div>
				{isVerified && (
					<div className="text-center text-green-500">
						Code is verified. You can proceed.
					</div>
				)}
				{!isVerified && isVerified !== "" && (
					<div className="text-center text-red-500">{errorMsg}</div>
				)}
			</div>
		</div>
	);
};

export default QRVerificationSetup;
