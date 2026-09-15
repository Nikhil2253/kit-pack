import axios from "axios";
import * as cheerio from "cheerio";
import updateGenerationStep from "../updateGenerationStep.js";
import { validateUrlSafety } from "../../utils/urlSafety.js";
import { retry } from "../../utils/retry.js";

export const researchCompany = async (state) => {
  try {
    await updateGenerationStep(
      state.kitId,
      "researching_company"
    );

    await validateUrlSafety(state.companyUrl);

    const response = await retry(
      () =>
        axios.get(state.companyUrl, {
          timeout: 10000,
          maxContentLength: 2 * 1024 * 1024,
          headers: {
            "User-Agent": "AI-Interview-Prep-Kit/1.0"
          }
        }),
      3,
      1000
    );

    const $ = cheerio.load(response.data);

    $("script, style, noscript, svg").remove();

    const title = $("title").text().trim();

    const headings = $("h1, h2, h3")
      .map((_, element) => $(element).text().trim())
      .get()
      .filter(Boolean);

    const text = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 30000);

    return {
      companyResearch: {
        url: state.companyUrl,
        title,
        headings,
        text,
        status: "success"
      }
    };
  } catch (error) {
    return {
      companyResearch: {
        url: state.companyUrl,
        title: "",
        headings: [],
        text: "",
        status: "failed",
        error: error.message
      }
    };
  }
};