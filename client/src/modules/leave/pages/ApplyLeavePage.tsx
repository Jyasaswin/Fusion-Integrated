import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Group,
  Input,
  Notification,
  Radio,
  Select,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { DateRange } from "@mantine/dates";
import { useLeaveRequests, useCreateLeaveRequest, useSubmitLeaveRequest } from "../hooks/useLeaveRequests";
import type { LeaveCategory } from "../api/types";

const CATEGORIES: { value: LeaveCategory; label: string }[] = [
  { value: "CL", label: "Casual Leave (CL)" },
  { value: "RH", label: "Restricted Holiday (RH)" },
  { value: "SCL", label: "Special Casual Leave (SCL)" },
  { value: "EL", label: "Earned Leave (EL)" },
  { value: "VL", label: "Vacation Leave (VL)" },
  { value: "COL", label: "Commuted Leave (COL)" },
];

const HALF_DAY_SESSIONS = [
  { value: "forenoon", label: "Forenoon" },
  { value: "afternoon", label: "Afternoon" },
];

export default function ApplyLeavePage() {
  const navigate = useNavigate();
  const notify = Notification.useNotification();
  const createLeave = useCreateLeaveRequest();
  const submitLeave = useSubmitLeaveRequest();

  const [formData, setFormData] = useState({
    category: "CL" as LeaveCategory,
    start_date: "",
    end_date: "",
    half_day: false,
    half_day_session: "forenoon",
    purpose: "",
    station_leave: false,
    station_leave_address: "",
    substitute_id: "",
  });

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: string, value: Date | [Date, Date] | null) => {
    if (field === "range" && Array.isArray(value) && value.length === 2) {
      setFormData((prev) => ({
        ...prev,
        start_date: value[0].toISOString().split("T")[0],
        end_date: value[1].toISOString().split("T")[0],
      }));
    }
  };

  const handleCreate = async () => {
    try {
      const leave = await createLeave.mutateAsync(formData);
      notify.show({ title: "Draft created", message: "Leave request saved as draft", color: "green" });
      navigate(`/leave/my-requests`);
    } catch (error) {
      notify.show({ title: "Error", message: "Failed to create leave request", color: "red" });
    }
  };

  const handleCreateAndSubmit = async () => {
    try {
      const leave = await createLeave.mutateAsync(formData);
      await submitLeave.mutateAsync(leave.id);
      notify.show({ title: "Submitted", message: "Leave request submitted for approval", color: "green" });
      navigate(`/leave/my-requests`);
    } catch (error) {
      notify.show({ title: "Error", message: "Failed to submit leave request", color: "red" });
    }
  };

  const isRH = formData.category === "RH";
  const isHalfDayAllowed = formData.category === "CL";
  const requiresSubstitute = ["SCL", "EL", "VL", "COL"].includes(formData.category);

  return (
    <Container size="lg">
      <PageHeader title="Apply for Leave" subtitle="Create a new leave request" />
      <Card padding="lg">
        <Form>
          <Stack gap="md">
            <Select
              label="Leave Category *"
              placeholder="Select leave category"
              value={formData.category}
              onChange={(v) => handleChange("category", v)}
              data={CATEGORIES}
              required
            />

            <DateRange
              label="Leave Period *"
              placeholder={["Start date", "End date"]}
              value={formData.start_date && formData.end_date ? [new Date(formData.start_date), new Date(formData.end_date)] : null}
              onChange={(v) => handleDateChange("range", v)}
              required
            />

            {isHalfDayAllowed && (
              <Group>
                <Radio.Group
                  label="Half Day"
                  value={formData.half_day}
                  onChange={(v) => handleChange("half_day", v)}
                  withAsterisk
                >
                  <Radio value={false}>Full Day</Radio>
                  <Radio value={true}>Half Day</Radio>
                </Radio.Group>
              </Group>
            )}

            {formData.half_day && isHalfDayAllowed && (
              <Select
                label="Session"
                placeholder="Select session"
                value={formData.half_day_session}
                onChange={(v) => handleChange("half_day_session", v)}
                data={HALF_DAY_SESSIONS}
                required
              />
            )}

            <Textarea
              label="Purpose *"
              placeholder="Enter purpose of leave"
              value={formData.purpose}
              onChange={(e) => handleChange("purpose", e.currentTarget.value)}
              minRows={3}
              required
            />

            <Group>
              <Radio.Group
                label="Station Leave (Outside Jabalpur)"
                value={formData.station_leave}
                onChange={(v) => handleChange("station_leave", v)}
              >
                <Radio value={false}>No</Radio>
                <Radio value={true}>Yes</Radio>
              </Radio.Group>
            </Group>

            {formData.station_leave && (
              <Textarea
                label="Station Leave Address"
                placeholder="Enter address during leave"
                value={formData.station_leave_address}
                onChange={(e) => handleChange("station_leave_address", e.currentTarget.value)}
                minRows={2}
              />
            )}

            {requiresSubstitute && (
              <Input
                label="Substitute Employee ID *"
                placeholder="Enter substitute's employee ID"
                type="number"
                value={formData.substitute_id}
                onChange={(e) => handleChange("substitute_id", e.currentTarget.value)}
                required
              />
            )}

            {isRH && (
              <Text color="dimmed" size="sm">
                Note: Restricted Holiday must be a published RH date.
              </Text>
            )}

            <Group>
              <Button onClick={handleCreate} loading={createLeave.isPending}>
                Save as Draft
              </Button>
              <Button onClick={handleCreateAndSubmit} loading={submitLeave.isPending} color="blue">
                Submit for Approval
              </Button>
            </Group>
          </Stack>
        </Form>
      </Card>
    </Container>
  );
}