import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // Since we're using Clerk's PricingTable, checkout is handled automatically
  // Redirect back to pricing page
  redirect("/pricing");
}