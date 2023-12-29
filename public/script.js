const signInButton = document.getElementById("signInButton"),
  signUpButton = document.getElementById("signUpButton"),
  logoutButton = document.getElementById("logoutButton"),
  authOverlay = document.getElementById("authOverlay"),
  signInForm = document.getElementById("signInForm"),
  signUpForm = document.getElementById("signUpForm"),
  verifyOtpForm = document.getElementById("verifyOtpForm"),
  verifyOtpSubmit = document.getElementById("verifyOtpSubmit"),
  runButton = document.getElementById("runButton"),
  outputElement = document.getElementById("output");

signInButton.addEventListener("click", () => {
  (authOverlay.style.display = "flex"),
    (signUpForm.style.display = "none"),
    (signInForm.style.display = "block"),
    (verifyOtpForm.style.display = "none");
}),
  signUpButton.addEventListener("click", () => {
    (authOverlay.style.display = "flex"),
      (signInForm.style.display = "none"),
      (signUpForm.style.display = "block"),
      (verifyOtpForm.style.display = "none");
  }),
  signInSubmit.addEventListener("click", async () => {
    var e = document.getElementById("signInEmail").value.toLowerCase(),
      t = document.getElementById("signInPassword").value,
      e = await (
        await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: e, password: t }),
        })
      ).json();
    // console.log(`token: ${e.token}`);
    if (e.token)
      localStorage.setItem("token", e.token),
        console.log("Logged in successfully"),
        (outputElement.textContent = ""),
        (authOverlay.style.display = "none"),
        (signInButton.style.display = "none"),
        (signUpButton.style.display = "none"),
        (logoutButton.style.display = "block");
    else {
      console.log("Login failed");
      const n = document.getElementById("signInErrorBox");
      (n.style.display = "block"),
        setTimeout(() => {
          (n.style.display = "none"), (authOverlay.style.display = "none");
        }, 3e3);
    }
  }),
  signUpSubmit.addEventListener("click", async () => {
    const email = document.getElementById("signUpEmail").value.toLowerCase();
    const password = document.getElementById("signUpPassword").value;
    outputElement.textContent = "";

    const response = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    console.log(data);
    if (
      data.message ===
      "OTP sent successfully. Please verify your email address."
    ) {
      alert("OTP sent successfully. Please verify your email address.");
      signUpForm.style.display = "none";
      verifyOtpForm.style.display = "block";
    } else {
      console.log("Sign-up failed");
      const signUpErrorBox = document.getElementById("signUpErrorBox");
      signUpErrorBox.style.display = "block";
      setTimeout(() => {
        signUpErrorBox.style.display = "none";
        authOverlay.style.display = "none";
      }, 3000);
    }
  }),
  verifyOtpSubmit.addEventListener("click", async () => {
    var e = document.getElementById("signUpEmail").value.toLowerCase(),
      t = document.getElementById("otpInput").value,
      n = document.getElementById("signUpPassword").value;
    const o = await fetch("/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e, otp: t, password: n }),
      }),
      l = await o.json();
    if ("User registered successfully" === l.message) {
      authOverlay.style.display = "none";
      const o = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: e, password: n }),
        }),
        l = await o.json();
      if (l.token)
        localStorage.setItem("token", l.token),
          console.log("Logged in successfully"),
          (outputElement.textContent = ""),
          (authOverlay.style.display = "none"),
          (signInButton.style.display = "none"),
          (signUpButton.style.display = "none"),
          (logoutButton.style.display = "block");
      else {
        console.log("Login failed");
        const s = document.getElementById("signInErrorBox");
        (s.style.display = "block"),
          setTimeout(() => {
            (s.style.display = "none"), (authOverlay.style.display = "none");
          }, 10);
      }
    } else {
      console.log("OTP verification failed");
      const i = document.getElementById("otpErrorBox");
      (i.style.display = "block"),
        setTimeout(() => {
          (i.style.display = "none"), (authOverlay.style.display = "none");
        }, 3e3);
    }
  }),
  logoutButton.addEventListener("click", async () => {
    var e = localStorage.getItem("token");
    (
      await fetch("/logout", {
        method: "POST",
        headers: { Authorization: "Bearer " + e },
      })
    ).ok &&
      (localStorage.removeItem("token"),
      (signInButton.style.display = "block"),
      (signUpButton.style.display = "block"),
      (logoutButton.style.display = "none"));
  }),
  document.addEventListener("DOMContentLoaded", async () => {
    var e = localStorage.getItem("token");
    if (e)
      try {
        (
          await fetch("/protected", {
            method: "GET",
            headers: { Authorization: `Bearer ${e}` },
          })
        ).ok
          ? (console.log("authentic user"),
            (signInButton.style.display = "none"),
            (signUpButton.style.display = "none"),
            (logoutButton.style.display = "block"))
          : (console.log("unauthentic user"),
            localStorage.removeItem("token"),
            (signInButton.style.display = "block"),
            (signUpButton.style.display = "block"),
            (logoutButton.style.display = "none"));
      } catch (e) {
        console.error("Error checking token:", e);
      }
    else
      (signInButton.style.display = "block"),
        (signUpButton.style.display = "block"),
        (logoutButton.style.display = "none");
  }),
  runButton.addEventListener("click", async () => {
    (runButton.disabled = !0),
      (runButton.textContent = "Running..."),
      (outputElement.textContent = "");
    var e = document.getElementById("code").value,
      t = document.getElementById("input").value,
      tokn = localStorage.getItem("token");
    console.log(`token is: ${tokn}`);
    try {
      var o = await (
        await fetch("/compile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokn}`,
          },
          body: JSON.stringify({ code: e, input: t }),
        })
      ).text();
      console.log(`o is: ${o}`);
      '{"message":"Please Sign in"}' === o
        ? (outputElement.textContent = "Please Sign in!")
        : (outputElement.textContent = o);
    } catch (e) {
      outputElement.textContent = "Error running code";
    } finally {
      (runButton.disabled = !1), (runButton.textContent = "Run Code");
    }
  }),
  signInButton.addEventListener("click", () => {
    (document.getElementById("signInEmail").value = ""),
      (document.getElementById("signInPassword").value = ""),
      (document.getElementById("otpInput").value = "");
  }),
  signUpButton.addEventListener("click", () => {
    (document.getElementById("signUpEmail").value = ""),
      (document.getElementById("signUpPassword").value = ""),
      (document.getElementById("otpInput").value = "");
  });
