const form = document.querySelector("#login-form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.querySelector("#email").value;
  const password = document.querySelector(["#pwd"]).value;
  const emailErr = document.querySelector("#email-error");
  const pwdErr = document.querySelector("#pwd-error");
  emailErr.classList.add("hidden");
  pwdErr.classList.add("hidden");

  const reponse = await fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const result = await reponse.json();
  if (reponse.ok) {
    window.sessionStorage.setItem("token", result.token);
    window.location.href = "./index.html";
  } else {
    if (reponse.status === 404) {
      emailErr.classList.remove("hidden");
    } else {
      pwdErr.classList.remove("hidden");
    }
  }
});
