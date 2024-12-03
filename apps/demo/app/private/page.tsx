import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import JsonViwer from "./_components/JsonViwer"
import Alert from "./_components/Alert"
export default async function DashboardPage() {
	const [session, activeSessions, deviceSessions, activeOrg, listOrgs] =
		await Promise.all([
			auth.api.getSession({
				headers: await headers(),
			}),
			auth.api.listSessions({
				headers: await headers(),
			}),
			auth.api.listDeviceSessions({
				headers: await headers(),
			}),
			auth.api.getFullOrganization({
				headers: await headers(),
			}),
            auth.api.listOrganizations({
				headers: await headers(),
			}),
            
		]).catch((e:any) => {
			throw redirect("/sign-in");
		});
    return (
    <div>
        <div className="mb-8">
            <Alert/>
        </div>
        <div className="grid grid-cols-2 gap-4">

            <div>
            <JsonViwer data={session??{}} title="api.getSession()"/>
            </div>
            <div>
                <JsonViwer data={activeSessions} title="api.listSessions()"/>
            </div>
            <div>
                <JsonViwer data={deviceSessions} title="api.listDeviceSessions()"/>
            </div>
            <div>
                <JsonViwer data={listOrgs} title="api.listOrganizations()"/>
            </div>
            <div>
                <JsonViwer data={activeOrg?? {}} title="api.getFullOrganization() (Active Tenant)"/>
            </div>
    
        </div>
    </div>

                )
}