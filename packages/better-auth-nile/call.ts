import { type Context } from "better-call";
import type { Session, User } from "better-auth/db/schema";
import { createAuthMiddleware } from "better-auth/api";
import { sessionMiddleware } from "better-auth/api";
import type { Role, defaultRoles } from "./access";
import type { OrganizationOptions } from "./organization";

export const orgMiddleware = createAuthMiddleware(async (ctx) => {
	return {} as {
		orgOptions: OrganizationOptions;
		roles: typeof defaultRoles & {
			[key: string]: Role<{}>;
		};
		getSession: (context: Context<any, any>) => Promise<{
			session: Session & {
				activeOrganizationId?: string;
			};
			user: User;
		}>;
	};
});

export const orgSessionMiddleware = createAuthMiddleware(
	{
		use: [sessionMiddleware],
	},
	async (ctx) => {
		const session = ctx.context.session as {
			session: Session & {
				activeOrganizationId?: string;
			};
			user: User;
		};
		return {
			session,
		};
	},
);