// const signInButton = document.getElementById("signInButton");
// const signUpButton = document.getElementById("signUpButton");
// const logoutButton = document.getElementById("logoutButton");
// const authOverlay = document.getElementById("authOverlay");
// const signInForm = document.getElementById("signInForm");
// const signUpForm = document.getElementById("signUpForm");
// const verifyOtpForm = document.getElementById("verifyOtpForm");
// const verifyOtpSubmit = document.getElementById("verifyOtpSubmit");
// const runButton = document.getElementById("runButton");
// const outputElement = document.getElementById("output");

// console.log("HI");

// signInButton.addEventListener("click", () => {
//   authOverlay.style.display = "flex";
//   signUpForm.style.display = "none";
//   signInForm.style.display = "block";
//   verifyOtpForm.style.display = "none";
// });

// signUpButton.addEventListener("click", () => {
//   authOverlay.style.display = "flex";
//   signInForm.style.display = "none";
//   signUpForm.style.display = "block";
//   verifyOtpForm.style.display = "none";
// });

// signInSubmit.addEventListener("click", async () => {
//   const email = document.getElementById("signInEmail").value.toLowerCase();
//   const password = document.getElementById("signInPassword").value;

//   const response = await fetch("/login", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ email, password }),
//   });

//   const data = await response.json();
//   if (data.token) {
//     localStorage.setItem("token", data.token);
//     console.log("Logged in successfully");

//     outputElement.textContent = "";
//     authOverlay.style.display = "none"; // Hide authentication overlay
//     signInButton.style.display = "none"; // Hide Sign In button
//     signUpButton.style.display = "none"; // Hide Sign Up button
//     logoutButton.style.display = "block"; // Show Logout button
//   } else {
//     console.log("Login failed");
//     const signInErrorBox = document.getElementById("signInErrorBox");
//     signInErrorBox.style.display = "block";
//     setTimeout(() => {
//       signInErrorBox.style.display = "none";
//       authOverlay.style.display = "none"; // Hide authentication overlay
//     }, 3000);
//   }
// });

// signUpSubmit.addEventListener("click", async () => {
//   const email = document.getElementById("signUpEmail").value.toLowerCase();
//   const password = document.getElementById("signUpPassword").value;
//   outputElement.textContent = "";

//   const response = await fetch("/register", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ email, password }),
//   });
//   const data = await response.json();
//   console.log(`data is: ${data}`);
//   if (
//     data.message === "OTP sent successfully. Please verify your email address."
//   ) {
//     alert("OTP sent successfully. Please verify your email address.");
//     signUpForm.style.display = "none";
//     verifyOtpForm.style.display = "block";
//   } else {
//     console.log("Sign-up failed");
//     const signUpErrorBox = document.getElementById("signUpErrorBox");
//     signUpErrorBox.style.display = "block";
//     setTimeout(() => {
//       signUpErrorBox.style.display = "none";
//       authOverlay.style.display = "none"; // Hide authentication overlay
//     }, 3000);
//   }
// });

// verifyOtpSubmit.addEventListener("click", async () => {
//   const email = document.getElementById("signUpEmail").value.toLowerCase();
//   const otp = document.getElementById("otpInput").value;
//   const password = document.getElementById("signUpPassword").value;

//   const response = await fetch("/verify-otp", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ email, otp, password }),
//   });

//   const data = await response.json();
//   if (data.message === "User registered successfully") {
//     authOverlay.style.display = "none";
//     const response = await fetch("/login", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ email, password }),
//     });

//     const data = await response.json();
//     if (data.token) {
//       localStorage.setItem("token", data.token);
//       console.log("Logged in successfully");

//       outputElement.textContent = "";
//       authOverlay.style.display = "none";
//       signInButton.style.display = "none";
//       signUpButton.style.display = "none";
//       logoutButton.style.display = "block";
//     } else {
//       console.log("Login failed");
//       const signInErrorBox = document.getElementById("signInErrorBox");
//       signInErrorBox.style.display = "block";
//       setTimeout(() => {
//         signInErrorBox.style.display = "none";
//         authOverlay.style.display = "none";
//       }, 10);
//     }
//   } else {
//     console.log("OTP verification failed");
//     const otpErrorBox = document.getElementById("otpErrorBox");
//     otpErrorBox.style.display = "block";
//     setTimeout(() => {
//       otpErrorBox.style.display = "none";
//       authOverlay.style.display = "none";
//     }, 3000);
//   }
// });

// logoutButton.addEventListener("click", async () => {
//   const token = localStorage.getItem("token");
//   const response = await fetch("/logout", {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   if (response.ok) {
//     localStorage.removeItem("token");
//     signInButton.style.display = "block";
//     signUpButton.style.display = "block";
//     logoutButton.style.display = "none";
//   }
// });

// document.addEventListener("DOMContentLoaded", async () => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     try {
//       const response = await fetch("/protected", {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.ok) {
//         // Token is valid, user is authenticated
//         console.log("authentic user");
//         signInButton.style.display = "none";
//         signUpButton.style.display = "none";
//         logoutButton.style.display = "block";
//       } else {
//         // Token is invalid, clear local storage
//         console.log("unauthentic user");
//         localStorage.removeItem("token");
//         signInButton.style.display = "block";
//         signUpButton.style.display = "block";
//         logoutButton.style.display = "none";
//       }
//     } catch (error) {
//       console.error("Error checking token:", error);
//     }
//   } else {
//     signInButton.style.display = "block";
//     signUpButton.style.display = "block";
//     logoutButton.style.display = "none";
//   }
// });

// runButton.addEventListener("click", async () => {
//   runButton.disabled = true;
//   runButton.textContent = "Running...";

//   outputElement.textContent = "";

//   const code = document.getElementById("code").value;
//   const input = document.getElementById("input").value;
//   const token = localStorage.getItem("token");

//   try {
//     const response = await fetch("/compile", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ code, input }),
//     });

//     const result = await response.text();
//     if (result === '{"message":"&&&&Please$$$$Sign@@@@in!!!!!!"}') {
//       const newResult = "Please Sign in!";
//       outputElement.textContent = newResult;
//     } else {
//       outputElement.textContent = result;
//     }
//   } catch (error) {
//     outputElement.textContent = "Error running code";
//   } finally {
//     runButton.disabled = false;
//     runButton.textContent = "Run Code";
//   }
// });

// signInButton.addEventListener("click", () => {
//   document.getElementById("signInEmail").value = "";
//   document.getElementById("signInPassword").value = "";
//   document.getElementById("otpInput").value = "";
// });

// signUpButton.addEventListener("click", () => {
//   document.getElementById("signUpEmail").value = "";
//   document.getElementById("signUpPassword").value = "";
//   document.getElementById("otpInput").value = "";
// });
