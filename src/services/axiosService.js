import axios from "axios";
import config from "./config";

// Function to create Axios instances dynamically
const createAxiosInstance = (baseURL, contentType = "application/json") => {
  const instance = axios.create({
    baseURL,
    headers: { "Content-Type": contentType },
  });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};

// Predefined instances
const defaultAxiosInstance = createAxiosInstance(config.apiBaseUrl);
const imageAxiosInstance = createAxiosInstance(
  config.apiBaseUrl,
  "multipart/form-data"
);

// Universal API Service
const apiService = async ({
  method,
  url,
  data,
  params,
  file,
  customBaseUrl,
  responseType = "json",
}) => {
  try {
    let instance;

    if (customBaseUrl) {
      instance = createAxiosInstance(
        customBaseUrl,
        file ? "multipart/form-data" : "application/json"
      );
    } else {
      instance = file ? imageAxiosInstance : defaultAxiosInstance;
    }

    const response = await instance({
      method,
      url,
      data,
      params,
      responseType, // Pass responseType to Axios (default is 'json')
    });

    return { data: response.data, statusCode: response.status };
  } catch (error) {
    console.error("API Error:", {
      message: error.message,
      url,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data || error;
  }
};

export default apiService;
