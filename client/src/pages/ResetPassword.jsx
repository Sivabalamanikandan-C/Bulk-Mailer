// import { useState } from "react";
// import axios from "axios";

// const ResetPassword = () => {

//   const [email,setEmail] = useState("");
//   const [password,setPassword] = useState("");
//   const [message,setMessage] = useState("");

//   const handleSubmit = async (e) => {

//     e.preventDefault();

//     try {

//       const res = await axios.post(
//         "http://localhost:5000/api/auth/reset-password",
//         { email, password }
//       );

//       setMessage(res.data.message);

//     } catch (error) {
//       setMessage("Error resetting password");
//     }
//   };

//   return (

//     <div>

//       <h2>Reset Password</h2>

//       <form onSubmit={handleSubmit}>

//         <input
//           type="email"
//           placeholder="Enter Email"
//           value={email}
//           onChange={(e)=>setEmail(e.target.value)}
//         />

//         <input
//           type="password"
//           placeholder="New Password"
//           value={password}
//           onChange={(e)=>setPassword(e.target.value)}
//         />

//         <button type="submit">
//           Update Password
//         </button>

//       </form>

//       <p>{message}</p>

//     </div>
//   );
// };

// export default ResetPassword;