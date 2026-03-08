import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Variant_present_late_absent,
  nanoToDate,
  useAttendanceByDate,
  useAttendanceByStudent,
  useMarkAttendance,
  useStudents,
} from "../hooks/useQueries";

const today = new Date().toISOString().split("T")[0];

type AttendanceStatus = Variant_present_late_absent;

function StatusBadge({ status }: { status: AttendanceStatus }) {
  if (status === Variant_present_late_absent.present) {
    return (
      <span className="badge-success px-2.5 py-0.5 rounded-full text-xs font-semibold">
        उपस्थित
      </span>
    );
  }
  if (status === Variant_present_late_absent.absent) {
    return (
      <span className="badge-danger px-2.5 py-0.5 rounded-full text-xs font-semibold">
        अनुपस्थित
      </span>
    );
  }
  return (
    <span className="badge-warning px-2.5 py-0.5 rounded-full text-xs font-semibold">
      देर से
    </span>
  );
}

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(today);
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: existingAttendance, isLoading: attendanceLoading } =
    useAttendanceByDate(selectedDate);
  const { data: studentHistory, isLoading: historyLoading } =
    useAttendanceByStudent(
      selectedStudentId ? BigInt(selectedStudentId) : null,
    );
  const markAttendance = useMarkAttendance();

  // Pre-fill from existing attendance when date changes
  const getStatus = (studentId: bigint): AttendanceStatus => {
    const key = studentId.toString();
    if (attendanceMap[key]) return attendanceMap[key];
    const existing = existingAttendance?.find(
      (a) => a.studentId.toString() === key,
    );
    return existing?.status ?? Variant_present_late_absent.present;
  };

  const setStatus = (studentId: bigint, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId.toString()]: status }));
  };

  const handleSubmit = async () => {
    if (!students?.length) {
      toast.error("कोई छात्र नहीं मिला");
      return;
    }
    try {
      const records = students.map((s) => ({
        studentId: s.id,
        date: selectedDate,
        status: getStatus(s.id),
      }));
      await markAttendance.mutateAsync(records);
      toast.success(`${students.length} छात्रों की उपस्थिति दर्ज हो गई`);
      setAttendanceMap({});
    } catch {
      toast.error("उपस्थिति दर्ज करने में समस्या आई");
    }
  };

  const presentCount = (students ?? []).filter(
    (s) => getStatus(s.id) === Variant_present_late_absent.present,
  ).length;
  const absentCount = (students ?? []).filter(
    (s) => getStatus(s.id) === Variant_present_late_absent.absent,
  ).length;
  const lateCount = (students ?? []).filter(
    (s) => getStatus(s.id) === Variant_present_late_absent.late,
  ).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          उपस्थिति प्रबंधन
        </h1>
        <p className="text-muted-foreground text-sm">Attendance Management</p>
      </div>

      <Tabs defaultValue="mark" className="space-y-5">
        <TabsList>
          <TabsTrigger value="mark" data-ocid="attendance.mark_tab">
            उपस्थिति दर्ज करें
          </TabsTrigger>
          <TabsTrigger value="view" data-ocid="attendance.view_tab">
            छात्र इतिहास देखें
          </TabsTrigger>
        </TabsList>

        {/* Mark Attendance Tab */}
        <TabsContent value="mark" className="space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="att-date">दिनांक चुनें</Label>
              <Input
                id="att-date"
                data-ocid="attendance.date_input"
                type="date"
                className="w-44"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setAttendanceMap({});
                }}
              />
            </div>

            {/* Summary counts */}
            {!studentsLoading && (students?.length ?? 0) > 0 && (
              <div className="flex items-center gap-3 mt-5">
                <span className="badge-success px-3 py-1 rounded-full text-xs font-semibold">
                  ✓ {presentCount} उपस्थित
                </span>
                <span className="badge-danger px-3 py-1 rounded-full text-xs font-semibold">
                  ✗ {absentCount} अनुपस्थित
                </span>
                <span className="badge-warning px-3 py-1 rounded-full text-xs font-semibold">
                  ⏱ {lateCount} देर से
                </span>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border overflow-hidden bg-card">
            {studentsLoading || attendanceLoading ? (
              <div
                data-ocid="attendance.loading_state"
                className="p-6 space-y-3"
              >
                {["s1", "s2", "s3", "s4", "s5"].map((k) => (
                  <Skeleton key={k} className="h-12 w-full" />
                ))}
              </div>
            ) : (students?.length ?? 0) === 0 ? (
              <div
                data-ocid="attendance.empty_state"
                className="p-10 text-center"
              >
                <CalendarCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-medium text-muted-foreground">
                  पहले छात्रों को जोड़ें
                </p>
              </div>
            ) : (
              <>
                <Table data-ocid="attendance.table">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">
                        छात्र का नाम
                      </TableHead>
                      <TableHead className="font-semibold">कक्षा</TableHead>
                      <TableHead className="font-semibold">रोल नं.</TableHead>
                      <TableHead className="font-semibold">स्थिति</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(students ?? []).map((student, i) => (
                      <TableRow
                        key={student.id.toString()}
                        data-ocid={`attendance.item.${i + 1}`}
                        className="hover:bg-muted/30"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-primary">
                                {student.name.charAt(0)}
                              </span>
                            </div>
                            <span className="font-medium text-sm">
                              {student.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {student.grade}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {student.rollNumber}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={getStatus(student.id)}
                            onValueChange={(v) =>
                              setStatus(student.id, v as AttendanceStatus)
                            }
                          >
                            <SelectTrigger
                              data-ocid={`attendance.select.${i + 1}`}
                              className="w-36 h-8 text-xs"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                value={Variant_present_late_absent.present}
                              >
                                ✓ उपस्थित
                              </SelectItem>
                              <SelectItem
                                value={Variant_present_late_absent.absent}
                              >
                                ✗ अनुपस्थित
                              </SelectItem>
                              <SelectItem
                                value={Variant_present_late_absent.late}
                              >
                                ⏱ देर से
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="p-4 border-t border-border flex justify-end">
                  <Button
                    data-ocid="attendance.submit_button"
                    onClick={handleSubmit}
                    disabled={markAttendance.isPending}
                    className="min-w-36"
                  >
                    {markAttendance.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    उपस्थिति सहेजें
                  </Button>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* View History Tab */}
        <TabsContent value="view" className="space-y-5">
          <div className="space-y-1.5 max-w-xs">
            <Label>छात्र चुनें</Label>
            <Select
              value={selectedStudentId}
              onValueChange={setSelectedStudentId}
            >
              <SelectTrigger data-ocid="attendance.student_select">
                <SelectValue placeholder="छात्र का नाम चुनें" />
              </SelectTrigger>
              <SelectContent>
                {(students ?? []).map((s) => (
                  <SelectItem key={s.id.toString()} value={s.id.toString()}>
                    {s.name} — {s.grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStudentId && (
            <div className="rounded-lg border border-border overflow-hidden bg-card">
              {historyLoading ? (
                <div
                  data-ocid="attendance.history.loading_state"
                  className="p-6 space-y-3"
                >
                  {["s1", "s2", "s3", "s4", "s5"].map((k) => (
                    <Skeleton key={k} className="h-10 w-full" />
                  ))}
                </div>
              ) : !studentHistory?.length ? (
                <div
                  data-ocid="attendance.history.empty_state"
                  className="p-10 text-center"
                >
                  <p className="font-medium text-muted-foreground">
                    इस छात्र का कोई रिकॉर्ड नहीं
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">#</TableHead>
                      <TableHead className="font-semibold">दिनांक</TableHead>
                      <TableHead className="font-semibold">स्थिति</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentHistory.map((record, i) => (
                      <TableRow
                        key={`${record.studentId.toString()}-${record.date.toString()}`}
                        data-ocid={`attendance.history.item.${i + 1}`}
                        className="hover:bg-muted/30"
                      >
                        <TableCell className="text-sm text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell className="text-sm">
                          {nanoToDate(record.date)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={record.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
