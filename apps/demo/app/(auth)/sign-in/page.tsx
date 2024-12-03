"use client";

import SignIn from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { Tabs } from "@/components/ui/tabs2";
import { client } from "@/lib/auth-client";
import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Page() {
	useEffect(() => {
		client.oneTap();
	}, []);

	return (
		<div className="w-full">
			<div className="flex items-center flex-col justify-center w-full md:py-10">
			
				<div className="md:w-[400px]">
					<Alert  className="mt-5 mb-5 bg-blue-800">
						<AlertTitle>Social Providers and email api Not configured</AlertTitle>

						<AlertDescription>
							<div className="grid mt-3">
							<AlertTitle>login with demo credentials</AlertTitle>
								<p>
									Email : demo@demo.com
								</p>
								<p>
									Password : demo@demo.com
								</p>
							</div>
						
						</AlertDescription>
					</Alert>
					<Tabs
						tabs={[
							{
								title: "Sign In",
								value: "sign-in",
								content: <SignIn />,
							},
							{
								title: "Sign Up",
								value: "sign-up",
								content: <SignUp />,
							},
						]}
					/>
				</div>
			</div>
		</div>
	);
}
