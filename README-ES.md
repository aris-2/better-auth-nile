## ¿que es esto?
Un proyecto de autenticación basado en Next.js y el plugin de organizaciones [Better-Auth](https://www.better-auth.com/docs/plugins/organization)  adaptado para funcionar con la base de datos [Nile](https://www.thenile.dev/).


## ¿Por qué es necesario esto?
Si bien podemos utilizar el plugin de organizaciones que nos ofrece [Better-Auth](https://www.better-auth.com/docs/plugins/organization) con [Nile](https://www.thenile.dev/) sin realizar ninguna modificación, al hacerlo perdemos la opción de utilizar la magia para aislar inquilinos que nos ofrece Nile.

## ¿Por qué sucede esto?
Para que el plugin de organizaciones de Better-Auth funcione con Nile debemos lograr 4 cosas:


1. **Utilizar las tablas integradas que nos ofrece Nile:**
   - Para almacenar las organizaciones debemos utilizar la tabla integrada `tenants` en lugar de `organizaciones`, ya que para aislar a los inquilinos usamos una referencia hacia el id de esta tabla (`tenant_id`).
   - Para almacenar a los miembros de las organizaciones debemos utilizar la tabla `tenant_users` en lugar de la tabla `members`, ya que esto nos permite comprobar si un usuario tiene acceso a un inquilino desde el SDK de Nile. Ejemplo:
     ```javascript
     nile.getInstance({
         tenantId: tenantId,
         userId: userId,
         api: {
             token: token,
         },
     });
     ```
    
    Para lograr esto utilizamos le definicion opcional del schema que nos ofrece better-auth para que use las tablas que requerimos [ver 792fa22][https://github.com/aris-2/better-auth-nile/commit/2ee498362a1f7a4aefb9bf32cd248fc051a60001]

   - Para almacenar la información de los usuarios, opcionalmente podemos utilizar la tabla integrada `users` que nos ofrece Nile en lugar de la tabla `user` que utiliza Better-Auth. Si bien esto no afecta el funcionamiento de Nile, utilizar la tabla `users` nos evita tener dos tablas que realicen la misma función.

   Para lograr utilizar estas tablas simplemente vamos a definir un esquema personalizado para el plugin en el archivo `auth.ts`.
    [ver](https://github.com/aris-2/better-auth-nile/commit/42fb0d9d7eca9ad4f6dd47219dbc0eb72306f54c)
2. **Tener en cuenta las limitaciones de clave foránea y unique que tenemos al utilizar Nile.** 
   El plugin de organizaciones tiene múltiples FK que hacen referencia a diferentes tablas. Para poder lograr la integración con Nile deberemos sacrificar algunas de ellas, debido a que Nile tiene limitaciones para usar FK entre tablas compartidas y aisladas. Ver: [tenant-sharing](https://www.thenile.dev/docs/tenant-virtualization/tenant-sharing). Así mismo, tiene una limitación al utilizar columnas del tipo unique en la tabla `tenants`.

   ### ¿Qué debemos sacrificar?
   1. **El uso de unique para el slug de las organizaciones:**
      Reemplazamos:
      ```sql
      "slug" text not null unique
      ```
      por:
      ```sql
      "slug" text not null
      ```
      Si bien en la tabla pueden existir múltiples filas con el mismo slug, Better-Auth realiza una comprobación mediante una query antes de crear una nueva organización, por lo que esta modificación no afecta al funcionamiento, pero sí a la integridad de los datos.

   2. **FK entre:**


   3. **Que el plugin de organizaciones funcione con UUID en lugar de nanoid.**
      Si bien Better-Auth nos ofrece una función para generar IDs personalizados, por el momento no funciona con los plugins. Para lograr esto, modificamos la función que se utiliza para generar el ID..

   4. **Modificar algunas operaciones CRUD para adaptarlas al uso de claves primarias compuestas:**
      Para lograrlo debemos agregar la referencia del `tenant_id` a algunas operaciones CRUD. Por ejemplo, pasamos de:
      ```javascript
      where: [
          {
              field: "id",
              value: memberId,
          },
      ],
      ```
      a:
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
      5- Modificar el tipo de role para que sea compatible con nile
        En el plugin de better auth los roles de los miembros de las organizaciones se almacenan como un array mientras que better-auth los almacena como un array para poder utilizar la columna roles integrada en nile debemos modificar la forma en la que better-auth almacena los roles pasando de "admin" a ['admin'] para mas detalles ver [](https://github.com/aris-2/better-auth-nile/commit/6cab8632743d0838d6bc04f4cbc1c522043d9551) 


## Instalar : 
- 1 - ejecutar npm install better-auth-nile    
- 2 - ejecutar las migrations.sql en su consola de nile 
- 3 - configurar las variavles de entorno


	advanced:{
		generateId:()=>{return uuidv4()}
	},

