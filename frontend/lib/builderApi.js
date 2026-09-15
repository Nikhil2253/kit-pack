import api from "./api";

export const updateSection = async (id, section, data) => {
  const response = await api.patch(
    `/builder/${id}/${section}`,
    data
  );

  return response.data;
};

export const updateQuestion = async (id, questionId, data) => {
  const response = await api.patch(
    `/builder/${id}/questions/${questionId}`,
    data
  );

  return response.data;
};

export const deleteQuestion = async (id, questionId) => {
  const response = await api.delete(
    `/builder/${id}/questions/${questionId}`
  );

  return response.data;
};