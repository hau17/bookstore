document.addEventListener("DOMContentLoaded", () => {
  function togglePassword(inputId, iconWrapperId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconWrapperId).querySelector("i");

    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";

    icon.classList.toggle("bi-eye");
    icon.classList.toggle("bi-eye-slash");
  }

  document.getElementById("togglePassword").addEventListener("click", () => {
    togglePassword("password", "togglePassword");
  });

  document
    .getElementById("toggleConfirmPassword")
    .addEventListener("click", () => {
      togglePassword("confirm_password", "toggleConfirmPassword");
    });
});
