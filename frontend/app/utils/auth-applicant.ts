export const getApplicantToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("applicantToken");
};

export const setApplicantToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("applicantToken", token);
  } else {
    localStorage.removeItem("applicantToken");
  }
};
