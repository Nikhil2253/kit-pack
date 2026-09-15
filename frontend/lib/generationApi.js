import api from "./api";

export const startGeneration = async (id) => {
  const response = await api.post(`/generation/${id}`);
  return response.data;
};

export const getGenerationStatus = async (id) => {
  const response = await api.get(`/generation/${id}/status`);
  return response.data;
};

export const regenerateSection = async (id, section) => {
  const response = await api.post(`/generation/${id}/${section}`);
  return response.data;
};