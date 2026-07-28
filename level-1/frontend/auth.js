const AUTH_BASE =
  window.location.protocol === "file:"
    ? "http://localhost:5000"
    : window.location.origin;

const AUTH_URL = `${AUTH_BASE}/api/auth`;

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const authMessage = document.getElementById("auth-message");
const signupMessage = document.getElementById("signup-message");

// If already logged in, go to products
if (localStorage.getItem("token")) {
  window.location.href = "index.html";
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authMessage.textContent = "";
  authMessage.classList.remove("error");

  try {
    const res = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: document.getElementById("login-email").value.trim(),
        password: document.getElementById("login-password").value,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    authMessage.textContent = "Login successful. Redirecting...";
    window.location.href = "index.html";
  } catch (err) {
    authMessage.textContent = err.message;
    authMessage.classList.add("error");
  }
});

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  signupMessage.textContent = "";
  signupMessage.classList.remove("error");

  try {
    const res = await fetch(`${AUTH_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: document.getElementById("signup-name").value.trim(),
        email: document.getElementById("signup-email").value.trim(),
        password: document.getElementById("signup-password").value,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Signup failed");

    signupMessage.textContent = "Account created. You can login now.";
    document.getElementById("login-email").value =
      document.getElementById("signup-email").value.trim();
    signupForm.reset();
  } catch (err) {
    signupMessage.textContent = err.message;
    signupMessage.classList.add("error");
  }
});
