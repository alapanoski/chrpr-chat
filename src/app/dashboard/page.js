import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"

export default async function Home() {
  const session = await getServerSession(authOptions)

  return <pre>{JSON.stringify(session)}</pre>
}
