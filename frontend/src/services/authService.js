/* eslint-disable no-unused-vars */
import { api, requestConfig } from "../utils/config";

/* Registrar usuário */
const register = async (data) => {
  const config = requestConfig("POST", data);

  try {
    const res = await fetch(api + "/users/register", config)
      .then((res) => res.json())
      .catch((err) => err);

    if (res) {
      localStorage.setItem("users", JSON.stringify(res));
    }
    return res;
  } catch (error) {
    console.log(error);
  }
};

/* Deslogar usuário */
const logout = () => {
  localStorage.removeItem("users");
};

/* Logar usuário */
const login = async (data) => {
  const config = requestConfig("POST", data);

  try {
    const res = await fetch(api + "/users/login", config)
      .then((res) => res.json())
      .catch((err) => err);

    if (res._id) {
      localStorage.setItem("user", JSON.stringify(res));
    }

    return res;
  } catch (error) {
    console.log(error);
  }
};

const authService = { register, logout, login };

export default authService;
