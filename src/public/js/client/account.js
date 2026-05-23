document.addEventListener("DOMContentLoaded", () => {
  function togglePassword(inputId, iconWrapperId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconWrapperId).querySelector("i");

    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";

    icon.classList.toggle("bi-eye");
    icon.classList.toggle("bi-eye-slash");
  }

  document.getElementById("toggleNewPassword").addEventListener("click", () => {
    togglePassword("newPassword", "toggleNewPassword");
  });

  document
    .getElementById("toggleConfirmPassword")
    .addEventListener("click", () => {
      togglePassword("confirmPassword", "toggleConfirmPassword");
    });
  document.getElementById("toggleOldPassword").addEventListener("click", () => {
    togglePassword("oldPassword", "toggleOldPassword");
  });
});
