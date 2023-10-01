export const validateLoginUsername = (username) => {
  // check if user exist in db ? true : false
  if (username !== "admin") {
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

export const validateEmail = (email) => {
  // https://www.w3resource.com/javascript/form/email-validation.php#:~:text=To%20get%20a%20valid%20email,%5D%2B)*%24%2F.
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
    email
  );
};

export const passwordWithUppercaseAndLowercase = (password) => {
  // ^(?=.*[a-z])(?=.*[A-Z])
  return /^(?=.*[a-z])(?=.*[A-Z])/.test(password);
};

export const passwordWithSymbol = (password) => {
  // (?=.*[!@#$%^&*])
  return /^(?=.*[!@#$%^&*])/.test(password);
};

export const passwordWithNumber = (password) => {
  return /[\d]/.test(password);
};

export const passwordWithLength = (password) => {
  return password.length >= 8;
};

export const validateLoginPassword = (username, password) => {
  // check if user
  if (username !== "admin" || password !== "admin") {
    return false;
  }
  return true;
};

export const validateRegisterPassword = (password) => {
  // check if password matches regex
  // https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
  // min 8 char, one upper and lower, one number, and one special char
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(
    password
  );
};

export const validateOTP = (otp) => {
  if (otp === "123456") {
    return true;
  }
  return false;
};
