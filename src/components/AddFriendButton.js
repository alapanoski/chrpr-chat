"use client"

import React, { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { addFriendValidator } from "@/lib/validations/add-friend"
import Button from "./ui/Button"
import axios, { AxiosError } from "axios"
import { useForm } from "react-hook-form"

const AddFriendButton = ({}) => {
  const [showSuccessState, setShowSuccessState] = useState(false)

  const { register, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(addFriendValidator),
  })

  const addFriend = async (email) => {
    try {
      const validatedEmail = addFriendValidator.parse({ email })

      await axios.post("/api/friends/add", {
        email: validatedEmail,
      })

      setShowSuccessState(true)
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError("email", { message: error.message })
        return
      }
      if (error instanceof AxiosError) {
        setError("email", { message: error.response?.data })
        return
      }
      setError("email", { message: "Something went wrong" })
    }
  }

  const onSubmit = (data) => {
    addFriend(data.email)
  }

  return (
    <form className="max-w-sm" onSubmit={handleSubmit(onSubmit)}>
      <label
        htmlFor="email"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Add friend by email
      </label>
      <div className="mt-2 flex gap-4">
        <input
          {...register("email")}
          type="text"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inse focus:ring-indigo-600 sm-text-sm sm:leading-6"
          placeholder="you@example.com"
        />
        <Button>Add</Button>
      </div>
      <p className="mt-1 text-sm text-red-600">
        {formState.errors?.email?.message}
        {showSuccessState ? (
          <p className="mt-1 text-sm text-red-600">Friend request sent!</p>
        ) : null}
      </p>
    </form>
  )
}

export default AddFriendButton
