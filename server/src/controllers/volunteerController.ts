import { Request, Response } from "express";
import { volunteerService } from "../services/volunteerService";
import { AuthRequest } from "../middleware/authMiddleware";

// Profiles
export const getVolunteers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const volunteers = await volunteerService.getAllVolunteers();
    res.status(200).json({ success: true, volunteers });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getVolunteerProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.params.id === "me" ? req.user!.id : req.params.id;
    const profile = await volunteerService.getProfile(userId as string);
    if (!profile) {
      res.status(404).json({ success: false, message: "Profile not found" });
      return;
    }
    res.status(200).json({ success: true, profile });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateVolunteerProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.params.id === "me" ? req.user!.id : req.params.id;

    // Authorization: only the volunteer or admin can update
    if (req.user!.role !== "ADMIN" && req.user!.id !== userId) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    const profile = await volunteerService.updateProfile(
      userId as string,
      req.body,
    );
    res.status(200).json({ success: true, profile });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Tasks
export const createTask = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { title, description, volunteerId, priority, incidentId } = req.body;
    const taskData: any = {
      title,
      description,
    };
    if (volunteerId) taskData.volunteerId = volunteerId;
    if (incidentId) taskData.incidentId = incidentId;
    if (volunteerId) taskData.status = "ASSIGNED";

    const task = await volunteerService.createTask(taskData);
    res.status(201).json({ success: true, task });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getTasks = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    let tasks;
    if (req.user!.role === "VOLUNTEER") {
      tasks = await volunteerService.getVolunteerTasks(req.user!.id as string);
    } else {
      tasks = await volunteerService.getAllTasks();
    }
    res.status(200).json({ success: true, tasks });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateTaskStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.body;

    if (req.user!.role === "VOLUNTEER") {
      const taskCheck = await volunteerService.getTaskById(
        req.params.id as string,
      );
      if (taskCheck?.volunteerId !== req.user!.id) {
        res
          .status(403)
          .json({ success: false, message: "Unauthorized: Not your task" });
        return;
      }
    }

    const task = await volunteerService.updateTaskStatus(
      req.params.id as string,
      status,
    );

    import("../services/auditService").then(({ logAudit }) => {
      logAudit(req.user!.id as string, "TASK_" + status, "Task", task.id);
    });

    res.status(200).json({ success: true, task });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: "Bad Request", error: error.message });
  }
};

export const assignTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { volunteerId } = req.body;
    const task = await volunteerService.assignTask(
      req.params.id as string,
      volunteerId,
    );

    import("../services/auditService").then(({ logAudit }) => {
      logAudit(req.user!.id as string, "VOLUNTEER_ASSIGNED", "Task", task.id);
    });

    res.status(200).json({ success: true, task });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
