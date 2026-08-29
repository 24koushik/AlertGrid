import { Request, Response } from "express";
import { incidentService } from "../services/incidentService";
import { AuthRequest } from "../middleware/authMiddleware";

export const createIncident = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const data = req.body;
    data.createdById = req.user!.id;
    const incident = await incidentService.createIncident(data);
    res.status(201).json({ success: true, incident });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getIncidents = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const incidents = await incidentService.getAllIncidents();
    res.status(200).json({ success: true, incidents });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getIncidentById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const incident = await incidentService.getIncidentById(
      req.params.id as string,
    );
    if (!incident) {
      res.status(404).json({ success: false, message: "Incident not found" });
      return;
    }
    res.status(200).json({ success: true, incident });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateIncident = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const incident = await incidentService.updateIncident(
      req.params.id as string,
      req.body,
    );
    res.status(200).json({ success: true, incident });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateIncidentStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.body;
    const incident = await incidentService.updateIncident(
      req.params.id as string,
      { status },
    );
    res.status(200).json({ success: true, incident });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
