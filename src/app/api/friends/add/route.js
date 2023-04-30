import { z } from "zod"
import { fetchRedis } from "@/app/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { addFriendValidator } from "@/lib/validations/add-friend"
import { getServerSession } from "next-auth"

export async function POST(req) {
  try {
    const body = await req.json()

    const { email } = addFriendValidator.parse(body.email)

    const idToAdd = await fetchRedis("get", `user:email:${email}`)

    console.log(idToAdd)

    if (!idToAdd) {
      return new Response("User not found", { status: 400 })
    }

    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response("Unauthorized", { status: 401 })
    }

    if (idToAdd === session.user.id) {
      return new Response("You can't add yourself as a friend", { status: 400 })
    }

    const isAlreadyAdded = await fetchRedis(
      "sismember",
      `user:${idToAdd}:incoming_friend_request`,
      session.user.id
    )

    if (isAlreadyAdded) {
      return new Response("You already sent a friend request to this user", {
        status: 400,
      })
    }

    const isAlreadyFriends = await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    )

    if (isAlreadyFriends) {
      return new Response("You already added this user as a friend", {
        status: 400,
      })
    }

    db.sadd(`user:${idToAdd}:incoming_friend_request`, session.user.id)

    return new Response("Friend request sent", { status: 200 })
  } catch (error) {
    console.log(error)

    if (error instanceof z.ZodError)
      return new Response("Invalid request payload", { status: 422 })

    return new Response("Invalid request", { status: 400 })
  }
}
