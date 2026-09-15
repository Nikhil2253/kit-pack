import {
  getFlashcards,
  updateConfidence
} from "../services/practice.service.js";

export const getPracticeFlashcards = async (req, res) => {
  try {
    const { id } = req.params;

    const flashcards = await getFlashcards(
      id,
      req.userId
    );

    res.json({
      success: true,
      flashcards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const setConfidence = async (req, res) => {
  try {
    const { id, flashcardId } = req.params;
    const { confidence } = req.body;

    const flashcard = await updateConfidence(
      id,
      req.userId,
      flashcardId,
      confidence
    );

    res.json({
      success: true,
      flashcard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};