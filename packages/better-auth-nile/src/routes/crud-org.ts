import { z } from "zod";
import { createAuthEndpoint } from "better-auth/api";
import { generateId } from "../utils";
import { getOrgAdapter } from "../adapter";
import { orgMiddleware, orgSessionMiddleware } from "../call";
import { APIError } from "better-call";
import { setSessionCookie } from "better-auth/cookies";

export const createOrganization = createAuthEndpoint(
	"/organization/create",
	{
		method: "POST",
		body: z.object({
			name: z.string({
				description: "The name of the organization",
			}),
			slug: z.string({
				description: "The slug of the organization",
			}),
			userId: z
				.string({
					description:
						"The user id of the organization creator. If not provided, the current user will be used. Should only be used by admins or when called by the server.",
				})
				.optional(),
			logo: z
				.string({
					description: "The logo of the organization",
				})
				.optional(),
			metadata: z
				.record(z.string(), z.any(), {
					description: "The metadata of the organization",
				})
				.optional(),
		}),
		use: [orgMiddleware, orgSessionMiddleware],
		metadata: {
			openapi: {
				description: "Create an organization",
				responses: {
					"200": {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									description: "The organization that was created",
									$ref: "#/components/schemas/Organization",
								},
							},
						},
					},
				},
			},
		},
	},
	async (ctx) => {
		const user = ctx.context.session.user;
		if (!user) {
			return ctx.json(null, {
				status: 401,
			});
		}
		const options = ctx.context.orgOptions;
		const canCreateOrg =
			typeof options?.allowUserToCreateOrganization === "function"
				? await options.allowUserToCreateOrganization(user)
				: options?.allowUserToCreateOrganization === undefined
					? true
					: options.allowUserToCreateOrganization;

		if (!canCreateOrg) {
			throw new APIError("FORBIDDEN", {
				message: "You are not allowed to create an organization",
			});
		}
		const adapter = getOrgAdapter(ctx.context, options);

		const userOrganizations = await adapter.listOrganizations(user.id);
		const hasReachedOrgLimit =
			typeof options.organizationLimit === "number"
				? userOrganizations.length >= options.organizationLimit
				: typeof options.organizationLimit === "function"
					? await options.organizationLimit(user)
					: false;

		if (hasReachedOrgLimit) {
			throw new APIError("FORBIDDEN", {
				message: "You have reached the organization limit",
			});
		}

		const existingOrganization = await adapter.findOrganizationBySlug(
			ctx.body.slug,
		);
		if (existingOrganization) {
			throw new APIError("BAD_REQUEST", {
				message: "Organization with this slug already exists",
			});
		}
		const organization = await adapter.createOrganization({
			organization: {
				id: generateId(),
				slug: ctx.body.slug,
				name: ctx.body.name,
				logo: ctx.body.logo,
				createdAt: new Date(),
				metadata: ctx.body.metadata,
			},
			user,
		});
		await adapter.setActiveOrganization(
			ctx.context.session.session.token,
			organization.id,
		);
		return ctx.json(organization);
	},
);

export const updateOrganization = createAuthEndpoint(
	"/organization/update",
	{
		method: "POST",
		body: z.object({
			data: z
				.object({
					name: z
						.string({
							description: "The name of the organization",
						})
						.optional(),
					slug: z
						.string({
							description: "The slug of the organization",
						})
						.optional(),
					logo: z
						.string({
							description: "The logo of the organization",
						})
						.optional(),
					metadata: z
						.record(z.string(), z.any(), {
							description: "The metadata of the organization",
						})
						.optional(),
				})
				.partial(),
			organizationId: z.string().optional(),
		}),
		requireHeaders: true,
		use: [orgMiddleware],
		metadata: {
			openapi: {
				description: "Update an organization",
				responses: {
					"200": {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									description: "The updated organization",
									$ref: "#/components/schemas/Organization",
								},
							},
						},
					},
				},
			},
		},
	},
	async (ctx) => {
		const session = await ctx.context.getSession(ctx);
		if (!session) {
			throw new APIError("UNAUTHORIZED", {
				message: "User not found",
			});
		}
		const organizationId =
			ctx.body.organizationId || session.session.activeOrganizationId;
		if (!organizationId) {
			return ctx.json(null, {
				status: 400,
				body: {
					message: "Organization id not found!",
				},
			});
		}
		const adapter = getOrgAdapter(ctx.context, ctx.context.orgOptions);
		const member = await adapter.findMemberByOrgId({
			userId: session.user.id,
			organizationId: organizationId,
		});
		if (!member) {
			return ctx.json(null, {
				status: 400,
				body: {
					message: "User is not a member of this organization!",
				},
			});
		}
		const role = ctx.context.roles[member.role[0]];
		if (!role) {
			return ctx.json(null, {
				status: 400,
				body: {
					message: "Role not found!",
				},
			});
		}
		const canUpdateOrg = role.authorize({
			organization: ["update"],
		});
		if (canUpdateOrg.error) {
			return ctx.json(null, {
				body: {
					message: "You are not allowed to update this organization",
				},
				status: 403,
			});
		}
		const updatedOrg = await adapter.updateOrganization(
			organizationId,
			ctx.body.data,
		);
		return ctx.json(updatedOrg);
	},
);

export const deleteOrganization = createAuthEndpoint(
	"/organization/delete",
	{
		method: "POST",
		body: z.object({
			organizationId: z.string({
				description: "The organization id to delete",
			}),
		}),
		requireHeaders: true,
		use: [orgMiddleware],
		metadata: {
			openapi: {
				description: "Delete an organization",
				responses: {
					"200": {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "string",
									description: "The organization id that was deleted",
								},
							},
						},
					},
				},
			},
		},
	},
	async (ctx) => {
		const session = await ctx.context.getSession(ctx);
		if (!session) {
			return ctx.json(null, {
				status: 401,
			});
		}
		const organizationId = ctx.body.organizationId;
		if (!organizationId) {
			return ctx.json(null, {
				status: 400,
				body: {
					message: "Organization id not found!",
				},
			});
		}
		const adapter = getOrgAdapter(ctx.context, ctx.context.orgOptions);
		const member = await adapter.findMemberByOrgId({
			userId: session.user.id,
			organizationId: organizationId,
		});
		if (!member) {
			return ctx.json(null, {
				status: 400,
				body: {
					message: "User is not a member of this organization!",
				},
			});
		}
		const role = ctx.context.roles[member.role[0]];
		if (!role) {
			return ctx.json(null, {
				status: 400,
				body: {
					message: "Role not found!",
				},
			});
		}
		const canDeleteOrg = role.authorize({
			organization: ["delete"],
		});
		if (canDeleteOrg.error) {
			throw new APIError("FORBIDDEN", {
				message: "You are not allowed to delete this organization",
			});
		}
		if (organizationId === session.session.activeOrganizationId) {
			/**
			 * If the organization is deleted, we set the active organization to null
			 */
			await adapter.setActiveOrganization(session.session.token, null);
		}
		await adapter.deleteOrganization(organizationId);
		return ctx.json(organizationId);
	},
);

export const getFullOrganization = createAuthEndpoint(
	"/organization/get-full-organization",
	{
		method: "GET",
		query: z.optional(
			z.object({
				organizationId: z
					.string({
						description: "The organization id to get",
					})
					.optional(),
				organizationSlug: z
					.string({
						description: "The organization slug to get",
					})
					.optional(),	
			}),
		),
		requireHeaders: true,
		use: [orgMiddleware, orgSessionMiddleware],
		metadata: {
			openapi: {
				description: "Get the full organization",
				responses: {
					"200": {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									description: "The organization",
									$ref: "#/components/schemas/Organization",
								},
							},
						},
					},
				},
			},
		},
	},
	async (ctx) => {
		const session = ctx.context.session;
		const organizationId =
			ctx.query?.organizationSlug ||
			ctx.query?.organizationId ||
			session.session.activeOrganizationId;

		if (!organizationId) {
			return ctx.json(null, {
				status: 200,
			});
		}
		const adapter = getOrgAdapter(ctx.context, ctx.context.orgOptions);
		const organization = await adapter.findFullOrganization({
			organizationId,
			isSlug: !!ctx.query?.organizationSlug,
		});
		if (!organization) {
			throw new APIError("BAD_REQUEST", {
				message: "Organization not found",
			});
		}
		return ctx.json(organization);
	},
);

export const setActiveOrganization = createAuthEndpoint(
	"/organization/set-active",
	{
		method: "POST",
		body: z.object({
			organizationId: z
				.string({
					description:
						"The organization id to set as active. It can be null to unset the active organization",
				})
				.nullable()
				.optional(),
			organizationSlug: z
				.string({
					description:
						"The organization slug to set as active. It can be null to unset the active organization if organizationId is not provided",
				})
				.optional(),
		}),
		use: [orgSessionMiddleware, orgMiddleware],
		metadata: {
			openapi: {
				description: "Set the active organization",
				responses: {
					"200": {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									description: "The organization",
									$ref: "#/components/schemas/Organization",
								},
							},
						},
					},
				},
			},
		},
	},
	async (ctx) => {
		const adapter = getOrgAdapter(ctx.context, ctx.context.orgOptions);
		const session = ctx.context.session;
		let organizationId = ctx.body.organizationSlug || ctx.body.organizationId;
		if (organizationId === null) {
			const sessionOrgId = session.session.activeOrganizationId;
			if (!sessionOrgId) {
				return ctx.json(null);
			}
			const updatedSession = await adapter.setActiveOrganization(
				session.session.token,
				null,
			);
			await setSessionCookie(ctx, {
				session: updatedSession,
				user: session.user,
			});
			return ctx.json(null);
		}
		if (!organizationId) {
			const sessionOrgId = session.session.activeOrganizationId;
			if (!sessionOrgId) {
				return ctx.json(null);
			}
			organizationId = sessionOrgId;
		}
		const organization = await adapter.findFullOrganization({
			organizationId,
			isSlug: !!ctx.body.organizationSlug,
		});
		const isMember = organization?.members.find(
			(member) => member.userId === session.user.id,
		);
		if (!isMember) {
			await adapter.setActiveOrganization(session.session.token, null);
			throw new APIError("FORBIDDEN", {
				message: "You are not a member of this organization",
			});
		}
		const updatedSession = await adapter.setActiveOrganization(
			session.session.token,
			organizationId,
		);
		await setSessionCookie(ctx, {
			session: updatedSession,
			user: session.user,
		});
		return ctx.json(organization);
	},
);

export const listOrganizations = createAuthEndpoint(
	"/organization/list",
	{
		method: "GET",
		use: [orgMiddleware, orgSessionMiddleware],
		metadata: {
			openapi: {
				description: "List all organizations",
				responses: {
					"200": {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: {
										$ref: "#/components/schemas/Organization",
									},
								},
							},
						},
					},
				},
			},
		},
	},
	async (ctx) => {
		const adapter = getOrgAdapter(ctx.context, ctx.context.orgOptions);
		const organizations = await adapter.listOrganizations(
			ctx.context.session.user.id,
		);
		return ctx.json(organizations);
	},
);
