import api from "./api";

export const getFlashcards = async (id) => {
  const response = await api.get(`/practice/${id}/flashcards`);
  return response.data;
};

export const updateConfidence = async (
  id,
  flashcardId,
  confidence
) => {
  const response = await api.patch(
    `/practice/${id}/flashcards/${flashcardId}/confidence`,
    { confidence }
  );

  return response.data;
};