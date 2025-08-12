"use client";
// @ts-nocheck
import { useState } from "react";
import { useNotifications } from "@/features/notifications/api/useNotifications";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export default function NotificationsTable() {
  const [filters, setFilters] = useState({
    unread_only: false,
    category: "all",
    priority: "all",
  });

  const { data, isLoading, isError, refetch } = useNotifications({
    unread_only: filters.unread_only || undefined,
    category: filters.category === "all" ? undefined : filters.category,
    priority: filters.priority === "all" ? undefined : filters.priority,
    limit: 50,
    offset: 0,
  });

  const categories = ["all", "shift_update", "emergency", "info"];
  const priorities = ["all", "low", "medium", "high", "urgent"];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={filters.unread_only}
            onCheckedChange={() => setFilters((p) => ({ ...p, unread_only: !p.unread_only }))}
          />
          Unread only
        </label>

        <div className="flex items-center gap-2 text-sm">
          <span>Category:</span>
          <Select value={filters.category} onValueChange={(value) => setFilters((p) => ({ ...p, category: value }))}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">
                  {c.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span>Priority:</span>
          <Select value={filters.priority} onValueChange={(value) => setFilters((p) => ({ ...p, priority: value }))}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((p) => (
                <SelectItem key={p} value={p} className="capitalize">
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button size="sm" onClick={() => refetch()}>Apply</Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <p>Loading...</p>
      ) : isError ? (
        <p className="text-destructive">Failed to load notifications</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Sent At</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((n) => (
              <TableRow key={n.notificationId} className={n.isRead ? "opacity-60" : ""}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{n.title}</span>
                    <span className="text-muted-foreground text-xs line-clamp-1 max-w-[300px]">
                      {n.message}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{n.category.replace("_", " ")}</TableCell>
                <TableCell>
                  <Badge variant={n.priority === "urgent" ? "destructive" : n.priority === "high" ? "secondary" : "outline"}>
                    {n.priority}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(n.sentAt).toLocaleString()}</TableCell>
                <TableCell>{n.isRead ? "Read" : "Unread"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
