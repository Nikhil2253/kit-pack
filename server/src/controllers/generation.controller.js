import Kit from "../models/Kit.js";
import { generateKit, regenerateSection as regenerateSectionService } from "../services/generation.service.js";

export const startGeneration = async (req, res) => {
  try {
    const { id } = req.params;

    const kit = await Kit.findOne({
      _id: id,
      user: req.userId
    });

    if (!kit) {
      return res.status(404).json({
        success: false,
        message: "Kit not found"
      });
    }

    if (kit.status === "generating") {
      return res.status(409).json({
        success: false,
        message: "Kit generation is already in progress"
      });
    }

    generateKit(id, req.userId).catch((error) => {
      console.error("Generation failed:", error.message);
    });

    res.status(202).json({
      success: true,
      message: "Kit generation started",
      status: "generating",
      kitId: kit._id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getGenerationStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const kit = await Kit.findOne({
      _id: id,
      user: req.userId
    }).select(
      "_id status generationError updatedAt"
    );

    if (!kit) {
      return res.status(404).json({
        success: false,
        message: "Kit not found"
      });
    }

    res.json({
      success: true,
      kitId: kit._id,
      status: kit.status,
      error: kit.generationError,
      updatedAt: kit.updatedAt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const regenerateSection = async (req, res) => {
  try {
    const { id, section } = req.params;

    const allowedSections = [
      "companyBrief",
      "roleBreakdown",
      "questions",
      "flashcards"
    ];

    if (!allowedSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: "Invalid section"
      });
    }

    const result = await regenerateSectionService(
      id,
      req.userId,
      section
    );

    res.json({
      success: true,
      message: `${section} regenerated successfully`,
      kit: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};