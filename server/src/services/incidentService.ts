import { incidentRepository } from "../repositories/incidentRepository";
import { Prisma } from "@prisma/client";
import { io } from "../index";

export class IncidentService {
  async createIncident(data: Prisma.IncidentUncheckedCreateInput) {
    const incident = await incidentRepository.create(data);
    io.emit("incident:created", incident);
    return incident;
  }

  async getIncidentById(id: string) {
    return await incidentRepository.findById(id);
  }

  async getAllIncidents() {
    return await incidentRepository.findAll();
  }

  async updateIncident(id: string, data: Prisma.IncidentUpdateInput) {
    const incident = await incidentRepository.update(id, data);
    io.emit("incident:updated", { id: incident.id, status: incident.status });
    return incident;
  }
}

export const incidentService = new IncidentService();
