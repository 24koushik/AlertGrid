import { Request, Response } from "express";
import { weatherService } from "../../services/weather/weatherService";
import { newsService } from "../../services/news/newsService";
import { imdWarningService } from "../../services/warnings/imdWarningService";

export const getWeather = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      res.status(400).json({ success: false, message: "Missing lat/lon" });
      return;
    }

    const weather = await weatherService.getWeather(Number(lat), Number(lon));
    res.status(200).json({ success: true, weather });
  } catch (error: any) {
    if (error.message === "API_NOT_CONFIGURED") {
      res.status(503).json({ success: false, message: "API_NOT_CONFIGURED" });
    } else {
      res
        .status(500)
        .json({
          success: false,
          message: "Server error",
          error: error.message,
        });
    }
  }
};

export const getNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    if (!query) {
      res.status(400).json({ success: false, message: "Missing query" });
      return;
    }

    const news = await newsService.getNews(query as string);
    res.status(200).json({ success: true, news });
  } catch (error: any) {
    if (error.message === "API_NOT_CONFIGURED") {
      res.status(503).json({ success: false, message: "API_NOT_CONFIGURED" });
    } else {
      res
        .status(500)
        .json({
          success: false,
          message: "Server error",
          error: error.message,
        });
    }
  }
};

export const getWarnings = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { region } = req.query;
    if (!region) {
      res.status(400).json({ success: false, message: "Missing region" });
      return;
    }

    const warnings = await imdWarningService.getWarnings(region as string);
    res.status(200).json({ success: true, warnings });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
