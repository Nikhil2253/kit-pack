import api from "./api";

export const getKits = async () => {
  const response = await api.get("/kits");
  return response.data;
};

export const getKit = async (id) => {
  const response = await api.get(`/kits/${id}`);
  return response.data;
};

export const createKit = async (data) => {
  const response = await api.post("/kits", data);
  return response.data;
};

export const updateKit = async (id, data) => {
  const response = await api.patch(`/kits/${id}`, data);
  return response.data;
};

export const deleteKit = async (id) => {
  const response = await api.delete(`/kits/${id}`);
  return response.data;
};

export const startGeneration = async (id) => {
  const response = await api.post(`/generation/${id}`);
  return response.data;
};

export const getGenerationStatus = async (id) => {
  const response = await api.get(`/generation/${id}/status`);
  return response.data;
};