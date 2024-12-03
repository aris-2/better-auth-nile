
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListDivider from "@mui/joy/ListDivider";

import { AddForm } from "./add-form";
import { DoneForm } from "./done-form"
import { configureNile } from "@/lib/Nile";
import {
  Card,
  CardContent,

  CardHeader,
  CardTitle,
} from "@/components/ui/card"


// Forcing to re-evaluate each time.
// This guarantees that users will only see their own data and not another user's data via cache
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;
export const fetchCache = "force-no-store";

// Todo: replace "raw" context setting with nicer SDK
export default async function Page() {
  // Here we are getting a connection to a specific tenant database for the current usr
  // if we already got such connection earlier, it will reuse the existing one
  const tenantNile = await configureNile();

  console.log(
    "showing todos for user " +
      tenantNile.userId +
      " for tenant " +
      tenantNile.tenantId
  );

  const todos = await tenantNile.db.query("SELECT * FROM todos ORDER BY title"); // no need for where clause because we previously set Nile context
  const resp = await tenantNile.db.query("SELECT name FROM tenants"); // no need for where clause because we previously set Nile context
  
  const tenant = resp.rows[0].name;

  return (
    <Card className="bg-muted ">
      <CardHeader className="flex items-center justify-center  ">
        {tenantNile.tenantId?
          <CardTitle className="text-2xl">Tenant {tenant} Todos</CardTitle>
        :
          <CardTitle className="text-2xl">View Todos for all Tenants</CardTitle>
        }
        <div className="w-[500px]">
          <AddForm />
        </div>
      </CardHeader>
      <CardContent >

      <List variant="plain" size="lg">
        <ListItem>
        </ListItem>
        <ListDivider />
        {todos.rows.map((todo: any) => (
          <div
            key={todo.id}
            style={{ display: "flex", flexWrap: "nowrap", padding: "0.5rem" }}
          >
            <ListItem key={todo.id}>
              <DoneForm tenantId={tenantNile.tenantId!} todo={todo} />
            </ListItem>
            <ListDivider />
          </div>
        ))}
      </List>
    </CardContent>
    </Card>
  );
}