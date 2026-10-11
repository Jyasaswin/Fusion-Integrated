import { Card, DataTable, Notification, Stack, Tag, Text } from "@mantine/core";
import { useLeaveRequests } from "../hooks/useLeaveRequests";
import type { LeaveStatus } from "../api/types";

const STATUS_COLORS: Record<LeaveStatus, string> = {
  draft: "gray",
  submitted: "blue",
  substitute_pending: "orange",
  unit_head_review: "violet",
  establishment_review: "cyan",
  final_sanction: "indigo",
  approved: "green",
  rejected: "red",
  withdrawn: "gray",
  cancelled: "gray",
  extension_requested: "orange",
  resumption_pending: "blue",
  resumed: "teal",
};

export default function LeaveHistoryPage() {
  const notify = Notification.useNotification();
  const { leaveRequests, isPending } = useLeaveRequests({});

  return (
    <Container size="xl">
      <PageHeader title="Leave History" subtitle="Complete history of your leave requests" />
      <Card padding="lg">
        <DataTable
          rows={leaveRequests.results}
          loading={isPending}
          minWidth={1000}
          columns={[
            { key: "id", header: "#" },
            { key: "category", header: "Category" },
            {
              key: "start_date",
              header: "From",
              render: (r) => new Date(r.start_date).toLocaleDateString(),
            },
            {
              key: "end_date",
              header: "To",
              render: (r) => new Date(r.end_date).toLocaleDateString(),
            },
            { key: "total_days", header: "Days" },
            { key: "purpose", header: "Purpose", truncate: 50 },
            { key: "station_leave", header: "Station Leave", render: (r) => r.station_leave ? "Yes" : "No" },
            {
              key: "status",
              header: "Status",
              render: (r) => (
                <Tag color={STATUS_COLORS[r.status as LeaveStatus] || "gray"} variant="light">
                  {r.status.replace("_", " ")}
                </Tag>
              ),
            },
            {
              key: "applied_at",
              header: "Applied",
              render: (r) => r.applied_at ? new Date(r.applied_at).toLocaleDateString() : "-",
            },
            {
              key: "approved_at",
              header: "Approved",
              render: (r) => r.approved_at ? new Date(r.approved_at).toLocaleDateString() : "-",
            },
          ]}
          empty={{ icon: "fa-regular:calendar-xmark", title: "No leave history", description: "You haven't applied for any leave yet." }}
        />
      </Card>
    </Container>
  );
}