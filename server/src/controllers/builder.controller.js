import {
  updateSection,
  updateQuestion,
  deleteQuestion
} from "../services/builder.service.js";

export const updateSectionController = async (req, res) => {
  try {
    const { id, section } = req.params;

    const kit = await updateSection(
      id,
      req.userId,
      section,
      req.body
    );

    res.json({
      success: true,
      kit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateQuestionController = async (req, res) => {
  try {
    const { id, questionId } = req.params;

    const kit = await updateQuestion(
      id,
      req.userId,
      questionId,
      req.body
    );

    res.json({
      success: true,
      kit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteQuestionController = async (req, res) => {
  try {
    const { id, questionId } = req.params;

    const kit = await deleteQuestion(
      id,
      req.userId,
      questionId
    );

    res.json({
      success: true,
      kit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};