import Kit from "../models/Kit.js";

export const createKit = async (req, res) => {
  try {
    const {
      jobDescription,
      companyUrl,
      daysUntilInterview
    } = req.body;

    if (!jobDescription || !companyUrl || !daysUntilInterview) {
      return res.status(400).json({
        success: false,
        message: "Job description, company URL and interview days are required"
      });
    }

    const days = Number(daysUntilInterview);

    if (!Number.isInteger(days) || days < 1 || days > 60) {
      return res.status(400).json({
        success: false,
        message: "Interview days must be between 1 and 60"
      });
    }

    const kit = await Kit.create({
      user: req.userId,
      jobDescription,
      companyUrl,
      daysUntilInterview: days
    });

    res.status(201).json({
      success: true,
      message: "Kit created successfully",
      kit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getKits = async (req, res) => {
  try {
    const kits = await Kit.find({
      user: req.userId
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      kits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getKit = async (req, res) => {
  try {
    const kit = await Kit.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!kit) {
      return res.status(404).json({
        success: false,
        message: "Kit not found"
      });
    }

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

export const updateKit = async (req, res) => {
  try {
    const {
      jobDescription,
      companyUrl,
      daysUntilInterview,
      companyBrief,
      roleBreakdown,
      questions,
      flashcards,
      schedule
    } = req.body;

    const updates = {};

    if (jobDescription !== undefined) updates.jobDescription = jobDescription;
    if (companyUrl !== undefined) updates.companyUrl = companyUrl;
    if (daysUntilInterview !== undefined) {
      const days = Number(daysUntilInterview);

      if (!Number.isInteger(days) || days < 1 || days > 60) {
        return res.status(400).json({
          success: false,
          message: "Interview days must be between 1 and 60"
        });
      }

      updates.daysUntilInterview = days;
    }

    if (companyBrief !== undefined) updates.companyBrief = companyBrief;
    if (roleBreakdown !== undefined) updates.roleBreakdown = roleBreakdown;
    if (questions !== undefined) updates.questions = questions;
    if (flashcards !== undefined) updates.flashcards = flashcards;
    if (schedule !== undefined) updates.schedule = schedule;

    const kit = await Kit.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId
      },
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!kit) {
      return res.status(404).json({
        success: false,
        message: "Kit not found"
      });
    }

    res.json({
      success: true,
      message: "Kit updated successfully",
      kit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteKit = async (req, res) => {
  try {
    const kit = await Kit.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!kit) {
      return res.status(404).json({
        success: false,
        message: "Kit not found"
      });
    }

    res.json({
      success: true,
      message: "Kit deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};