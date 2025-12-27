export function validatePassword(password: string) {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter.";
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) {
    return "Password must include at least one special character.";
  }
  return null;
}
