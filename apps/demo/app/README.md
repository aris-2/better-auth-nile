## What is this?
An authentication project based on Next.js and the [Better-Auth](https://www.better-auth.com/docs/plugins/organization) organizations plugin, adapted to work with the [Nile](https://www.thenile.dev/) database.

## Why is this necessary?
Although we can use the organizations plugin provided by [Better-Auth](https://www.better-auth.com/docs/plugins/organization) with [Nile](https://www.thenile.dev/) without modifications, doing so prevents us from using Nile's magic for tenant isolation.

## Why does this happen?
To make Better-Auth's organizations plugin work with Nile, we need to achieve four things:

1. **Use Nile's integrated tables:**
   - To store organizations, we must use the integrated `tenants` table instead of `organizations`, as tenant isolation relies on referencing the ID of this table (`tenant_id`).
   - To store organization members, we must use the `tenant_users` table instead of the `members` table, allowing us to check if a user has access to a tenant via the Nile SDK. Example:
     ```javascript
     nile.getInstance({
         tenantId: tenantId,
         userId: userId,
         api: {
             token: token,
         },
     });
     ```
   - To store user information, we can optionally use Nile's integrated `users` table instead of the `user` table used by Better-Auth. While this does not affect Nile's functionality, using the `users` table avoids having two tables serving the same purpose.

   To use these tables, we will define a custom schema for the plugin in the `auth.ts` file.

2. **Consider the foreign key and unique constraints limitations in Nile.**
   The organizations plugin has multiple FKs referencing different tables. To integrate with Nile, we need to forgo some of these constraints because Nile has limitations with FKs between shared and isolated tables. See: [tenant-sharing](https://www.thenile.dev/docs/tenant-virtualization/tenant-sharing). Additionally, there are limitations when using unique columns in the `tenants` table.

   ### What must we compromise?
   1. **The use of unique for the organization slugs:**
      Replace:
      ```sql
      "slug" text not null unique
      ```
      with:
      ```sql
      "slug" text not null
      ```
      While the table may contain multiple rows with the same slug, Better-Auth performs a query check before creating a new organization. This change does not affect functionality but does impact data integrity.

   3. **Make the organizations plugin work with UUID instead of nanoid.**
      While Better-Auth provides a function to generate custom IDs, it does not currently work with plugins. To achieve this, modify the function used to generate the ID. See: [88494d1](https://github.com/aris-2/better-auth-nile/commit/88494d1c5642db62300017e453f3bcf9d13bb685).

   4. **Modify some CRUD operations to adapt them to the use of composite primary keys:**
      Add the `tenant_id` reference to certain CRUD operations. For example, change:
      ```javascript
      where: [
          {
              field: "id",
              value: memberId,
          },
      ],
      ```
      to:
      ```javascript
      where: [
          {
              field: "id",
              value: memberId,
          },
          {
              field: "organizationId",
              value: organizationId,
          },
      ],
      ```

## Setup: 
- Execute the `migrations.sql` file in your Nile console.  
- Configure the environment variables.
