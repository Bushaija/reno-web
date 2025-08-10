import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { BulkCreateShiftsDTO } from "@/types/scheduling";

interface BulkCreateResponse {
  success: boolean;
  message: string;
  data: {
    created_count: number;
    shifts: any[]; // You can replace any with Shift[] if needed
  };
}

async function postBulkCreate(data: BulkCreateShiftsDTO): Promise<BulkCreateResponse> {
  const res = await fetch("/shifts/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to bulk create shifts");
  }
  return (await res.json()) as BulkCreateResponse;
}

export function useBulkCreateShifts() {
  const queryClient = useQueryClient();
  return useMutation<BulkCreateResponse, Error, BulkCreateShiftsDTO>({
    mutationFn: postBulkCreate,
    onSuccess: (res) => {
      toast.success(res.message || "Bulk shifts created");
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
    },
    onError: (err) => toast.error(err.message),
  });
}
