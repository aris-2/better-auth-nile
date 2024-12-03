import Nile from "@niledatabase/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Initialize the Nile server object for reuse in all pages
// Note that the Nile server configuration points to Nile APIs as the base path

// Initialize the Nile server object for reuse in all pages
// Note that the Nile server configuration points to Nile APIs as the base path

const nile = Nile();

export default nile;

// This returns a reference to the Nile Server, configured with the user's auth token and tenantID (if any)
// If Nile already have a connection to the same tenant database for the same user, we'll return an existing connection
export async function configureNile() {
  const session = await auth.api.getSession({
        headers: await headers(),
    })

  const server = await nile;
  return server.getInstance({
    tenantId: session?.session?.activeOrganizationId,
    //@ts-ignore
    userId: session?.user?.id,
    api: {
      token: undefined, // since we authenticated via NextAuth, we don't have a Nile auth token for the user. This means we can't use some of Nile's APIs.
    },
  });
}

