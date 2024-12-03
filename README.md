## What is this?
A Next.js-based authentication project using the [Better-Auth](https://www.better-auth.com/docs/plugins/organization) plugin for organizations, adapted to work with the [Nile](https://www.thenile.dev/) database.

## Why is this necessary?
While we can use the Better-Auth organization plugin with Nile without modifications, doing so loses the tenant isolation features that Nile offers.

## Why does this happen?
For the Better-Auth organization plugin to work with Nile, we need to achieve the following 4 things:

### 1. **Use the integrated tables provided by Nile:**
   - To store organizations, we must use the integrated `tenants` table instead of `organizations`, because we need a reference to this table (`tenant_id`) to isolate tenants.
   - To store organization members, we must use the `tenant_users` table instead of the `members` table, as this allows us to check if a user has access to a tenant using the Nile SDK. Example:
     ```javascript
     nile.getInstance({
         tenantId: tenantId,
         userId: userId,
         api: {
             token: token,
         },
     });
     ```

   To achieve this, we use Better-Auth's optional schema definition to utilize the required tables [see commit 792fa22](https://github.com/aris-2/better-auth-nile/commit/2ee498362a1f7a4aefb9bf32cd248fc051a60001).

   - To store user information, optionally, we can use the integrated `users` table from Nile instead of the `user` table used by Better-Auth. While this does not affect Nile's operation, using the `users` table prevents having two tables performing the same function.

   To use these tables, we simply define a custom schema for the plugin in the `auth.ts` file. [See commit](https://github.com/aris-2/better-auth-nile/commit/42fb0d9d7eca9ad4f6dd47219dbc0eb72306f54c).

### 2. **Consider foreign key and unique constraints when using Nile:**
   The organization plugin has multiple foreign keys that reference different tables. To integrate it with Nile, we must sacrifice some of them because Nile has limitations on using foreign keys between shared and isolated tables. See: [tenant-sharing](https://www.thenile.dev/docs/tenant-virtualization/tenant-sharing). It also has a limitation when using unique columns in the `tenants` table.

   ### What do we need to sacrifice?
   1. **Use of unique for organization slugs:**
      We replace:
      ```sql
      "slug" text not null unique
      ```
      with:
      ```sql
      "slug" text not null
      ```
      Although multiple rows with the same slug can now exist in the table, Better-Auth performs a check before creating a new organization, so this modification does not affect functionality but does affect data integrity.

   2. **Foreign keys:**
      To adapt foreign keys to Nile while considering the limitations of shared tables, the user reference is moved to a table that is isolated. See images for details.

      **Better-Auth Plugin Table Relationships**
      ![Original plugin tables](/images/better-auth.png)

      **Custom Relationships: The `users` table remains shared, so it will have no foreign keys.**
      ![Nile tables](/images/nile.webp)

   3. **Make the organization plugin work with UUID instead of nanoid:**
      Although Better-Auth provides a function to generate custom IDs, it currently does not work with the plugins. To fix this, we modify the function used to generate the ID.

   4. **Modify some CRUD operations to adapt to using composite primary keys:**
      To do this, we need to add the `tenant_id` reference to some CRUD operations. For example, we change from:
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

   5. **Modify the role type to be compatible with Nile:**
      In the Better-Auth plugin, organization member roles are stored as strings, whereas Nile stores them as an array. To use the `roles` column integrated in Nile, we modify how Better-Auth stores roles, for example, changing from `"admin"` to `['admin']`. For more details, see [commit](https://github.com/aris-2/better-auth-nile/commit/6cab8632743d0838d6bc04f4cbc1c522043d9551).

## Installation: 
1. Run the migrations.sql in your Nile console [see](/apps/demo//lib/migrations.sql).
2. Run `npm install better-auth-nile`.
3. Configure the environment variables.
4. Configure custom ID generation in your `auth.ts` to use UUID [see](/apps/demo/lib/auth.ts).
5. Define a custom schema for the `users` table, which will allow using Nile's `users` table [see](/apps/demo/lib/auth.ts).
