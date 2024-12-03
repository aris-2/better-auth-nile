"use client";
import Checkbox from "@mui/joy/Checkbox";
import Typography from "@mui/joy/Typography";
import { useTransition } from "react";
import { completeTodo } from "./todo-actions";
import { toast } from "sonner";
import CircularProgress from '@mui/joy/CircularProgress';


const initialState = {
  message: null,
};

export function DoneForm({
  tenantId,
  todo,
}: {
  tenantId: string;
  todo: { id: string; title: string; complete: boolean };
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <>
    {isPending?
      <CircularProgress size="sm" />
    :
      <Checkbox
        label={<Typography sx={{ color: 'white' }}>{todo.title}</Typography>}
        checked={todo.complete}
        onChange={() =>
          startTransition(() => {
            completeTodo(tenantId, todo.id, !todo.complete);
          })
        }
      />
    }
    
    </>

  );
}