import { Card, Group, Notification, Select, Stack, Text, Button } from "@mantine/core";
import { useYearEndProcessing } from "../hooks/useLeaveRequests";

export default function LeaveReportsPage() {
  const notify = Notification.useNotification();
  const [year, setYear] = useState(() => new Date().getFullYear());
  const yearEnd = useYearEndProcessing();

  const handleYearEnd = async () => {
    if (!window.confirm(`Run year-end processing for ${year}? This will process all leave balances.`)) return;
    try {
      const result = await yearEnd.mutateAsync(year);
      notify.show({
        title: "Year-End Processing Complete",
        message: `Processed ${result.processed_users} users. ${result.errors.length} errors.`,
        color: result.errors.length === 0 ? "green" : "orange",
      });
    } catch {
      notify.show({ title: "Error", message: "Year-end processing failed", color: "red" });
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <Container size="xl">
      <PageHeader title="Leave Reports" subtitle="Generate leave reports and run year-end processing" />
      <Card padding="lg">
        <Stack gap="md">
          <Text weight={600} size="lg">Year-End Leave Processing</Text>
          <Text color="dimmed">
            Run year-end processing to apply lapse rules, convert unused faculty VL to EL, and carry forward applicable balances.
          </Text>
          <Group>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="mantine-Input-input"
              style={{ width: 150 }}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <Button onClick={handleYearEnd} loading={yearEnd.isPending} color="blue">
              Run Year-End Processing
            </Button>
          </Group>
        </Stack>
      </Card>

      <Card padding="lg">
        <Stack gap="md">
          <Text weight={600} size="lg">Leave Balance Report</Text>
          <Text color="dimmed">Leave balance reports can be generated from the Leave Balance page by selecting the year.</Text>
          <Button variant="outline" color="blue">Generate Balance Report</Button>
        </Stack>
      </Card>

      <Card padding="lg">
        <Stack gap="md">
          <Text weight={600} size="lg">Leave History Report</Text>
          <Text color="dimmed">Generate leave history reports for employees.</Text>
          <Button variant="outline" color="blue">Generate History Report</Button>
        </Stack>
      </Card>

      <Card padding="lg">
        <Stack gap="md">
          <Text weight={600} size="lg">Pending Approvals Report</Text>
          <Text color="dimmed">Report on leave requests pending at each approval level.</Text>
          <Button variant="outline" color="blue">Generate Pending Report</Button>
        </Stack>
      </Card>
    </Container>
  );
}