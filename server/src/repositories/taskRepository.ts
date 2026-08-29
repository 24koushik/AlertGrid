import { PrismaClient, Task, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export class TaskRepository {
  async create(data: Prisma.TaskUncheckedCreateInput): Promise<Task> {
    return await prisma.task.create({ data });
  }

  async findById(id: string): Promise<Task | null> {
    return await prisma.task.findUnique({ where: { id } });
  }

  async findAll(): Promise<Task[]> {
    return await prisma.task.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findByVolunteerId(volunteerId: string): Promise<Task[]> {
    return await prisma.task.findMany({
      where: { volunteerId },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, data: Prisma.TaskUpdateInput): Promise<Task> {
    return await prisma.task.update({ where: { id }, data });
  }
}

export const taskRepository = new TaskRepository();
