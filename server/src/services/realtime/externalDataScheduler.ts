import { gdacsService } from "../disasters/gdacsService";
import { usgsEarthquakeService } from "../disasters/usgsEarthquakeService";
import { alertService } from "../alertService";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ExternalDataScheduler {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  start(intervalMs = 5 * 60 * 1000) {
    if (this.timer) return;
    this.timer = setInterval(() => this.run(), intervalMs);
    // run immediately on start
    setTimeout(() => this.run(), 5000);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  async run() {
    if (this.isRunning) return;
    this.isRunning = true;
    try {
      console.log("[Scheduler] Running external data ingestion...");
      await this.ingestGdacs();
      await this.ingestUsgs();
      console.log("[Scheduler] Ingestion complete.");
    } catch (e: any) {
      console.error("[Scheduler] Error during ingestion:", e.message);
    } finally {
      this.isRunning = false;
    }
  }

  private async ingestGdacs() {
    const events = await gdacsService.fetchLatestDisasters();
    await this.processEvents(events);
  }

  private async ingestUsgs() {
    const events = await usgsEarthquakeService.fetchLatestEarthquakes();
    await this.processEvents(events);
  }

  private async processEvents(events: any[]) {
    for (const ev of events) {
      try {
        const existing = await prisma.alert.findUnique({
          where: { sourceEventId: ev.sourceEventId },
        });

        if (existing) continue;

        const expiryTime = new Date(ev.issuedAt);
        expiryTime.setDate(expiryTime.getDate() + 3);

        const alertData = {
          title: ev.title,
          description: ev.description,
          disasterType: ev.eventType,
          severity: ev.severity,
          latitude: ev.latitude,
          longitude: ev.longitude,
          radius: 500.0, // Set affected radius to 500km for major external events
          startTime: ev.issuedAt,
          expiryTime,
          status: "ACTIVE" as const,
          source: ev.source,
          sourceEventId: ev.sourceEventId,
          communityId: null, // Global coordinate-based alert, dynamically affects all communities in radius
        };

        // This handles DB creation, Socket.IO emission to affected communities, and Citizen notifications!
        await alertService.createAlert(alertData);
      } catch (err: any) {
        console.error(
          `[Scheduler] Failed to process event ${ev.sourceEventId}:`,
          err.message,
        );
      }
    }
  }

  // Haversine formula
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const externalDataScheduler = new ExternalDataScheduler();
