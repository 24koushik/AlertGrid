import { volunteerRepository } from "../repositories/volunteerRepository";
import { taskRepository } from "../repositories/taskRepository";
import { Prisma } from "@prisma/client";
import { io } from "../index";

export class VolunteerService {
  async getProfile(userId: string) {
    return await volunteerRepository.findProfileByUserId(userId);
  }

  async updateProfile(
    userId: string,
    data: Partial<Prisma.VolunteerProfileUpdateInput>,
  ) {
    return await volunteerRepository.createOrUpdateProfile(userId, data as any);
  }

  async getAllVolunteers() {
    return await volunteerRepository.getAllVolunteers();
  }

  // Tasks
  async createTask(data: Prisma.TaskUncheckedCreateInput) {
    const task = await taskRepository.create(data);
    io.emit("task:created", task);
    return task;
  }

  async getTaskById(id: string) {
    return await taskRepository.findById(id);
  }

  async getAllTasks() {
    return await taskRepository.findAll();
  }

  async getVolunteerTasks(volunteerId: string) {
    return await taskRepository.findByVolunteerId(volunteerId);
  }

  async updateTaskStatus(id: string, status: string) {
    const existing = await taskRepository.findById(id);
    if (!existing) throw new Error("Task not found");

    if (existing.status === "COMPLETED") {
      throw new Error("Cannot change status of a completed task");
    }

    const task = await taskRepository.update(id, { status: status as any });
    io.emit("task:updated", { id: task.id, status: task.status });
    return task;
  }

  async assignTask(taskId: string, volunteerId: string) {
    const task = await taskRepository.update(taskId, {
      volunteer: { connect: { id: volunteerId } },
      status: "ASSIGNED",
    });
    io.emit("task:assigned", { id: task.id, volunteerId });
    return task;
  }
}

export const volunteerService = new VolunteerService();
