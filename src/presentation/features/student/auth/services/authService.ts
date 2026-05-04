import axios from "axios";

const API_URL = "http://localhost:3000"; 

export const loginRequest = async (data: {
  correo: string;
  contrasena: string;
}) => {
  const response = await axios.post(`${API_URL}/api/auth/login`, data);
  return response.data;
};