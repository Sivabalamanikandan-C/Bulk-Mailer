// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const ForgotPassword = () => {

//   const [email, setEmail] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // redirect to reset password page
//     navigate("/reset-password");
//   };

//   return (
//     <div>
//       <h2>Forgot Password</h2>

//       <form onSubmit={handleSubmit}>

//         <input
//           type="email"
//           placeholder="Enter Email"
//           value={email}
//           onChange={(e)=>setEmail(e.target.value)}
//           required
//         />

//         <button type="submit">
//           Reset Password
//         </button>

//       </form>
//     </div>
//   );
// };

// export default ForgotPassword;