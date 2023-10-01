export const validateLoginUsername = (username) => {
  // check if user exist in db ? true : false
  if (username !== "admin") {
    return false;
  }
  return true;
};

export const validateLoginPassword = (username, password) => {
  // check if user
  if (username !== "admin" || password !== "admin") {
    return false;
  }
  return true;
};

export const validateRegisterUsername = (username) => {
  // check if user exist in db ? false : true
  if (username === "admin") {
    return false;
  }
  return true;
};

export const validateRegisterPassword = (password) => {
  // check if password matches regex
  // https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
  // min 8 char, one upper and lower, one number, and one special char
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
    password
  );
};
