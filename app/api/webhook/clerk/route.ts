import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyWebhook } from "@clerk/backend/webhooks";

// * New try with Clerk's built-in webhook handling instead of manual verification - SMASHED IT

export async function POST(request: Request) {
  try {
    const evt = await verifyWebhook(request);

    // Access the event data
    const eventType = evt.type;

    // Handle specific event types
    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name } = evt.data;

      const primaryEmail = email_addresses.find(
        (email) => email.id === evt.data.primary_email_address_id,
      )?.email_address;

      if (!primaryEmail) {
        return new Response("No primary email found", { status: 400 });
      }

      try {
        // Upsert user into Neon database
        await db
          .insert(users)
          .values({
            clerkUserId: id,
            email: primaryEmail,
            firstName: first_name || "",
            lastName: last_name || "",
          })
          .onConflictDoUpdate({
            target: users.clerkUserId,
            set: {
              email: primaryEmail,
              firstName: first_name || "",
              lastName: last_name || "",
            },
          });
      } catch (err) {
        console.error("Error syncing user to DB:", err);
        return new Response("Database Error", { status: 500 });
      }
    }

    // Handle user deletion
    if (eventType === "user.deleted") {
      const { id } = evt.data;

      if (id) {
        try {
          await db.delete(users).where(eq(users.clerkUserId, id));
        } catch (err) {
          console.error("Error deleting user from DB:", err);
          return new Response("Database Error", { status: 500 });
        }
      }
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }
}
