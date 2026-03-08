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
import { IndianRupee, Loader2, Plus, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Variant_pending_paid,
  nanoToDate,
  useAddFeeRecord,
  useFeeRecordsByStudent,
  useStudents,
} from "../hooks/useQueries";

interface FeeForm {
  feeType: string;
  amountDue: string;
  amountPaid: string;
  paymentDate: string;
  status: Variant_pending_paid;
}

const emptyForm: FeeForm = {
  feeType: "",
  amountDue: "",
  amountPaid: "",
  paymentDate: new Date().toISOString().split("T")[0],
  status: Variant_pending_paid.pending,
};

function StatusBadge({ status }: { status: Variant_pending_paid }) {
  if (status === Variant_pending_paid.paid) {
    return (
      <span className="badge-paid px-2.5 py-0.5 rounded-full text-xs font-semibold">
        ✓ भुगतान हुआ
      </span>
    );
  }
  return (
    <span className="badge-pending px-2.5 py-0.5 rounded-full text-xs font-semibold">
      ⏳ बकाया
    </span>
  );
}

export default function Fees() {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [form, setForm] = useState<FeeForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const { data: students } = useStudents();
  const { data: fees, isLoading: feesLoading } = useFeeRecordsByStudent(
    selectedStudentId ? BigInt(selectedStudentId) : null,
  );
  const addFeeRecord = useAddFeeRecord();

  const selectedStudent = students?.find(
    (s) => s.id.toString() === selectedStudentId,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      toast.error("पहले छात्र चुनें");
      return;
    }
    const due = Number.parseFloat(form.amountDue);
    const paid = Number.parseFloat(form.amountPaid);
    if (!form.feeType || Number.isNaN(due) || Number.isNaN(paid)) {
      toast.error("कृपया सभी फ़ील्ड सही से भरें");
      return;
    }
    try {
      await addFeeRecord.mutateAsync({
        studentId: BigInt(selectedStudentId),
        feeType: form.feeType,
        amountDue: Math.round(due),
        amountPaid: Math.round(paid),
        paymentDate: form.paymentDate || null,
        status: form.status,
      });
      toast.success("शुल्क रिकॉर्ड जोड़ा गया");
      setForm(emptyForm);
      setShowForm(false);
    } catch {
      toast.error("शुल्क रिकॉर्ड जोड़ने में समस्या आई");
    }
  };

  // Summary stats
  const totalDue = fees?.reduce((acc, f) => acc + Number(f.amountDue), 0) ?? 0;
  const totalPaid =
    fees?.reduce((acc, f) => acc + Number(f.amountPaid), 0) ?? 0;
  const totalPending = totalDue - totalPaid;
  const paidCount =
    fees?.filter((f) => f.status === Variant_pending_paid.paid).length ?? 0;
  const pendingCount =
    fees?.filter((f) => f.status === Variant_pending_paid.pending).length ?? 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          शुल्क प्रबंधन
        </h1>
        <p className="text-muted-foreground text-sm">Fee Management</p>
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
            <SelectTrigger data-ocid="fees.student_select">
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
            data-ocid="fees.open_modal_button"
            variant="outline"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            नया शुल्क जोड़ें
          </Button>
        )}
      </div>

      {/* Add Fee Form */}
      {showForm && selectedStudentId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">
                नया शुल्क — {selectedStudent?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="f-type">शुल्क का प्रकार *</Label>
                    <Input
                      id="f-type"
                      data-ocid="fee.fee_type_input"
                      placeholder="जैसे: मासिक शुल्क, वार्षिक शुल्क"
                      value={form.feeType}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, feeType: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="f-due">देय राशि (₹) *</Label>
                    <Input
                      id="f-due"
                      data-ocid="fee.amount_due_input"
                      type="number"
                      min={0}
                      placeholder="देय राशि"
                      value={form.amountDue}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, amountDue: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="f-paid">भुगतान राशि (₹)</Label>
                    <Input
                      id="f-paid"
                      data-ocid="fee.amount_paid_input"
                      type="number"
                      min={0}
                      placeholder="भुगतान राशि"
                      value={form.amountPaid}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, amountPaid: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="f-date">भुगतान दिनांक</Label>
                    <Input
                      id="f-date"
                      data-ocid="fee.payment_date_input"
                      type="date"
                      value={form.paymentDate}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, paymentDate: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>स्थिति *</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) =>
                        setForm((p) => ({
                          ...p,
                          status: v as Variant_pending_paid,
                        }))
                      }
                    >
                      <SelectTrigger data-ocid="fee.status_select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Variant_pending_paid.paid}>
                          ✓ भुगतान हुआ
                        </SelectItem>
                        <SelectItem value={Variant_pending_paid.pending}>
                          ⏳ बकाया
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    data-ocid="fee.submit_button"
                    disabled={addFeeRecord.isPending}
                  >
                    {addFeeRecord.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    शुल्क सहेजें
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

      {/* Summary Cards */}
      {selectedStudentId && fees && fees.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "कुल देय",
              value: `₹${totalDue.toLocaleString("en-IN")}`,
              color: "text-foreground",
            },
            {
              label: "कुल भुगतान",
              value: `₹${totalPaid.toLocaleString("en-IN")}`,
              color: "text-green-600",
            },
            {
              label: "बकाया",
              value: `₹${totalPending.toLocaleString("en-IN")}`,
              color: "text-red-600",
            },
            {
              label: "रिकॉर्ड",
              value: `${paidCount} भुगतान / ${pendingCount} बकाया`,
              color: "text-muted-foreground",
            },
          ].map((stat) => (
            <Card key={stat.label} className="py-0">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className={`text-base font-display font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Fees Table */}
      {selectedStudentId && (
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          {feesLoading ? (
            <div data-ocid="fees.loading_state" className="p-6 space-y-3">
              {["s1", "s2", "s3"].map((k) => (
                <Skeleton key={k} className="h-10 w-full" />
              ))}
            </div>
          ) : !fees?.length ? (
            <div data-ocid="fees.empty_state" className="p-10 text-center">
              <Wallet className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium text-muted-foreground">
                इस छात्र का कोई शुल्क रिकॉर्ड नहीं
              </p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                ऊपर से नया शुल्क रिकॉर्ड जोड़ें
              </p>
            </div>
          ) : (
            <Table data-ocid="fees.table">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">#</TableHead>
                  <TableHead className="font-semibold">शुल्क प्रकार</TableHead>
                  <TableHead className="font-semibold">देय राशि</TableHead>
                  <TableHead className="font-semibold">भुगतान</TableHead>
                  <TableHead className="font-semibold">शेष</TableHead>
                  <TableHead className="font-semibold">दिनांक</TableHead>
                  <TableHead className="font-semibold">स्थिति</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.map((fee, i) => {
                  const balance =
                    Number(fee.amountDue) - Number(fee.amountPaid);
                  return (
                    <TableRow
                      key={`${fee.feeType}-${fee.amountDue.toString()}-${i}`}
                      data-ocid={`fees.item.${i + 1}`}
                      className="hover:bg-muted/30"
                    >
                      <TableCell className="text-sm text-muted-foreground">
                        {i + 1}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {fee.feeType}
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        <span className="flex items-center gap-0.5">
                          <IndianRupee className="h-3 w-3" />
                          {Number(fee.amountDue).toLocaleString("en-IN")}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-mono text-green-600">
                        <span className="flex items-center gap-0.5">
                          <IndianRupee className="h-3 w-3" />
                          {Number(fee.amountPaid).toLocaleString("en-IN")}
                        </span>
                      </TableCell>
                      <TableCell
                        className={`text-sm font-mono ${balance > 0 ? "text-red-600" : "text-green-600"}`}
                      >
                        <span className="flex items-center gap-0.5">
                          <IndianRupee className="h-3 w-3" />
                          {balance.toLocaleString("en-IN")}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {fee.paymentDate ? nanoToDate(fee.paymentDate) : "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={fee.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {!selectedStudentId && (
        <div
          className="rounded-lg border border-border p-12 text-center bg-card"
          data-ocid="fees.empty_state"
        >
          <Wallet className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-medium text-muted-foreground">
            शुल्क देखने के लिए छात्र चुनें
          </p>
        </div>
      )}
    </div>
  );
}
