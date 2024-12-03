"use client";

import { addTodo } from "./todo-actions";
import { toast } from "sonner";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
 
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
 

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
})



export function AddForm() {
  // ...
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    try{
      toast.loading("Creating todo in progress...",{ id: "new-todo" })
      await addTodo(values.title)
      toast.success("todo creating with success",{ id: "new-todo" })

    }catch(e:any){
      toast.error("error in creating new todo",{ id: "new-todo" })
    }
  }


  return (
    <Form {...form} >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Todo Name</FormLabel>
              <FormControl>
                <Input className="border border-gray-400 p-2" placeholder="Todo Name" {...field} />
              </FormControl>
           
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" variant="secondary" type="submit">Submit</Button>
      </form>
    </Form>
  )
}