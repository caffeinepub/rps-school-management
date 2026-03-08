import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { FileText, Loader2, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddResult,
  useResultsByStudent,
  useStudents,
} from "../hooks/useQueries";

interface ResultForm {
  examName: string;
  subject: string;
  marksObtained: string;
  totalMarks: string;
}

const emptyForm: ResultForm = {
  examName: "",
  subject: "",
  marksObtained: "",
  totalMarks: "",
};

function getGrade(percent: number): { label: string; color: string } {
  if (percent >= 90) return { label: "A+", color: "text-emerald-600" };
  if (percent >= 80) return { label: "A", color: "text-green-600" };
  if (percent >= 70) return { label: "B+", color: "text-teal-600" };
  if (percent >= 60) return { label: "B", color: "text-blue-600" };
  if (percent >= 50) return { label: "C", color: "text-amber-600" };
  if (percent >= 33) return { label: "D", color: "text-orange-600" };
  return { label: "F", color: "text-red-600" };
}

function PercentBadge({
  obtained,
  total,
}: { obtained: bigint; total: bigint }) {
  const pct =
    total > 0n ? Math.round((Number(obtained) / Number(total)) * 100) : 0;
  const grade = getGrade(pct);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-muted-foreground">
        {pct}%
      </span>
      <span className={`text-xs font-bold ${grade.color}`}>{grade.label}</span>
    </div>
  );
}

export default function Results() {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [form, setForm] = useState<ResultForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const { data: students } = useStudents();
  const { data: results, isLoading: resultsLoading } = useResultsByStudent(
    selectedStudentId ? BigInt(selectedStudentId) : null,
  );
  const addResult = useAddResult();

  const selectedStudent = students?.find(
    (s) => s.id.toString() === selectedStudentId,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      toast.error("पहले छात्र चुनें");
      return;
    }
    const obtained = Number.parseInt(form.marksObtained);
    const total = Number.parseInt(form.totalMarks);
    if (
      !form.examName ||
      !form.subject ||
      Number.isNaN(obtained) ||
      Number.isNaN(total)
    ) {
      toast.error("कृपया सभी फ़ील्ड सही से भरें");
      return;
    }
    if (obtained > total) {
      toast.error("प्राप्तांक, कुल अंक से अधिक नहीं हो सकता");
      return;
    }
    try {
      await addResult.mutateAsync({
        studentId: BigInt(selectedStudentId),
        examName: form.examName,
        subject: form.subject,
        marksObtained: obtained,
        totalMarks: total,
      });
      toast.success("परिणाम जोड़ा गया");
      setForm(emptyForm);
      setShowForm(false);
    } catch {
      toast.error("परिणाम जोड़ने में समस्या आई");
    }
  };

  // Aggregate stats
  const avgPercent = results?.length
    ? Math.round(
        results.reduce(
          (acc, r) =>
            acc + (Number(r.marksObtained) / Number(r.totalMarks)) * 100,
          0,
        ) / results.length,
      )
    : null;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          परिणाम प्रबंधन
        </h1>
        <p className="text-muted-foreground text-sm">Result Management</p>
      </div>

      {/* Student Select */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5 min-w-64">
          <Label>छात्र चुनें</Label>
          <Select
            value={selectedStudentId}
            onValueChange={(v) => {
              setSelectedStudentId(v);
              setShowForm(false);
            }}
          >
            <SelectTrigger data-ocid="results.student_select">
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
          <Button
            data-ocid="results.open_modal_button"
            variant="outline"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            नया परिणाम जोड़ें
          </Button>
        )}
      </div>

      {/* Add Result Form (inline) */}
      {showForm && selectedStudentId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">
                नया परिणाम — {selectedStudent?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="r-exam">परीक्षा का नाम *</Label>
                    <Input
                      id="r-exam"
                      data-ocid="result.exam_name_input"
                      placeholder="जैसे: वार्षिक परीक्षा"
                      value={form.examName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, examName: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="r-subject">विषय *</Label>
                    <Input
                      id="r-subject"
                      data-ocid="result.subject_input"
                      placeholder="जैसे: गणित, हिंदी"
                      value={form.subject}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, subject: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="r-obtained">प्राप्त अंक *</Label>
                    <Input
                      id="r-obtained"
                      data-ocid="result.marks_obtained_input"
                      type="number"
                      min={0}
                      placeholder="प्राप्त अंक"
                      value={form.marksObtained}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          marksObtained: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="r-total">कुल अंक *</Label>
                    <Input
                      id="r-total"
                      data-ocid="result.total_marks_input"
                      type="number"
                      min={1}
                      placeholder="कुल अंक"
                      value={form.totalMarks}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, totalMarks: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    data-ocid="result.submit_button"
                    disabled={addResult.isPending}
                  >
                    {addResult.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    परिणाम सहेजें
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setForm(emptyForm);
                    }}
                  >
                    रद्द करें
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Results Table */}
      {selectedStudentId && (
        <div className="space-y-4">
          {/* Stats row */}
          {results && results.length > 0 && avgPercent !== null && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                <strong className="text-foreground">{results.length}</strong>{" "}
                परीक्षाएं
              </span>
              <span className="text-muted-foreground">
                औसत:{" "}
                <strong className={getGrade(avgPercent).color}>
                  {avgPercent}% ({getGrade(avgPercent).label})
                </strong>
              </span>
            </div>
          )}

          <div className="rounded-lg border border-border overflow-hidden bg-card">
            {resultsLoading ? (
              <div data-ocid="results.loading_state" className="p-6 space-y-3">
                {["s1", "s2", "s3"].map((k) => (
                  <Skeleton key={k} className="h-10 w-full" />
                ))}
              </div>
            ) : !results?.length ? (
              <div data-ocid="results.empty_state" className="p-10 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-medium text-muted-foreground">
                  इस छात्र का कोई परिणाम नहीं
                </p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  ऊपर से नया परिणाम जोड़ें
                </p>
              </div>
            ) : (
              <Table data-ocid="results.table">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">#</TableHead>
                    <TableHead className="font-semibold">परीक्षा</TableHead>
                    <TableHead className="font-semibold">विषय</TableHead>
                    <TableHead className="font-semibold">प्राप्त / कुल</TableHead>
                    <TableHead className="font-semibold">
                      प्रतिशत / ग्रेड
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, i) => (
                    <TableRow
                      key={`${result.examName}-${result.subject}-${i}`}
                      data-ocid={`results.item.${i + 1}`}
                      className="hover:bg-muted/30"
                    >
                      <TableCell className="text-sm text-muted-foreground">
                        {i + 1}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {result.examName}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-secondary text-secondary-foreground">
                          {result.subject}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        <span className="font-bold text-foreground">
                          {result.marksObtained.toString()}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          / {result.totalMarks.toString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <PercentBadge
                          obtained={result.marksObtained}
                          total={result.totalMarks}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}

      {!selectedStudentId && (
        <div
          className="rounded-lg border border-border p-12 text-center bg-card"
          data-ocid="results.empty_state"
        >
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-medium text-muted-foreground">
            परिणाम देखने के लिए छात्र चुनें
          </p>
        </div>
      )}
    </div>
  );
}
