import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Student } from "../backend.d";
import {
  useAddStudent,
  useDeleteStudent,
  useStudents,
  useUpdateStudent,
} from "../hooks/useQueries";

interface StudentForm {
  name: string;
  grade: string;
  rollNumber: string;
  parentName: string;
  contact: string;
}

const emptyForm: StudentForm = {
  name: "",
  grade: "",
  rollNumber: "",
  parentName: "",
  contact: "",
};

export default function Students() {
  const { data: students, isLoading, isError } = useStudents();
  const addStudent = useAddStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<bigint | null>(null);

  const filtered = (students ?? []).filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.grade.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditingStudent(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setForm({
      name: student.name,
      grade: student.grade,
      rollNumber: student.rollNumber,
      parentName: student.parentName,
      contact: student.contact,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.grade || !form.rollNumber) {
      toast.error("कृपया सभी आवश्यक फ़ील्ड भरें");
      return;
    }
    try {
      if (editingStudent) {
        await updateStudent.mutateAsync({ id: editingStudent.id, ...form });
        toast.success("छात्र की जानकारी अपडेट हो गई");
      } else {
        await addStudent.mutateAsync(form);
        toast.success("नया छात्र जोड़ा गया");
      }
      setModalOpen(false);
      setForm(emptyForm);
    } catch {
      toast.error("कुछ गलत हुआ, पुनः प्रयास करें");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteStudent.mutateAsync(id);
      toast.success("छात्र हटा दिया गया");
      setDeleteConfirmId(null);
    } catch {
      toast.error("हटाने में समस्या आई");
    }
  };

  const isPending = addStudent.isPending || updateStudent.isPending;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            छात्र प्रबंधन
          </h1>
          <p className="text-muted-foreground text-sm">
            Student Management — {students?.length ?? 0} छात्र
          </p>
        </div>
        <Button
          data-ocid="students.open_modal_button"
          onClick={openAdd}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          नया छात्र जोड़ें
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          data-ocid="students.search_input"
          placeholder="नाम, कक्षा या रोल नं. खोजें..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden bg-card">
        {isLoading ? (
          <div data-ocid="students.loading_state" className="p-6 space-y-3">
            {["s1", "s2", "s3", "s4", "s5"].map((k) => (
              <Skeleton key={k} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div
            data-ocid="students.error_state"
            className="p-10 text-center text-destructive"
          >
            <p className="font-medium">डेटा लोड करने में समस्या आई</p>
            <p className="text-sm text-muted-foreground mt-1">
              कृपया पृष्ठ को ताज़ा करें
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div data-ocid="students.empty_state" className="p-10 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-medium text-muted-foreground">
              {search ? "कोई परिणाम नहीं मिला" : "अभी कोई छात्र नहीं है"}
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              {search ? "खोज बदलकर देखें" : "ऊपर बटन से छात्र जोड़ें"}
            </p>
          </div>
        ) : (
          <Table data-ocid="students.table">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">नाम</TableHead>
                <TableHead className="font-semibold">कक्षा</TableHead>
                <TableHead className="font-semibold">रोल नं.</TableHead>
                <TableHead className="font-semibold">अभिभावक</TableHead>
                <TableHead className="font-semibold">संपर्क</TableHead>
                <TableHead className="font-semibold text-right">
                  कार्रवाई
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filtered.map((student, i) => (
                  <motion.tr
                    key={student.id.toString()}
                    data-ocid={`students.item.${i + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
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
                    <TableCell>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-secondary text-secondary-foreground">
                        {student.grade}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {student.rollNumber}
                    </TableCell>
                    <TableCell className="text-sm">
                      {student.parentName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {student.contact}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          data-ocid={`students.edit_button.${i + 1}`}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => openEdit(student)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          data-ocid={`students.delete_button.${i + 1}`}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                          onClick={() => setDeleteConfirmId(student.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md" data-ocid="students.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingStudent ? "छात्र जानकारी संपादित करें" : "नया छात्र जोड़ें"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="s-name">नाम *</Label>
                <Input
                  id="s-name"
                  data-ocid="student.name_input"
                  placeholder="छात्र का पूरा नाम"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-grade">कक्षा *</Label>
                <Input
                  id="s-grade"
                  data-ocid="student.grade_input"
                  placeholder="जैसे: 5A, 10B"
                  value={form.grade}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, grade: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-roll">रोल नं. *</Label>
                <Input
                  id="s-roll"
                  data-ocid="student.roll_number_input"
                  placeholder="रोल नंबर"
                  value={form.rollNumber}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, rollNumber: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="s-parent">अभिभावक का नाम</Label>
                <Input
                  id="s-parent"
                  data-ocid="student.parent_name_input"
                  placeholder="माता/पिता का नाम"
                  value={form.parentName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, parentName: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="s-contact">संपर्क नंबर</Label>
                <Input
                  id="s-contact"
                  data-ocid="student.contact_input"
                  placeholder="मोबाइल नंबर"
                  value={form.contact}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, contact: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="students.cancel_button"
                onClick={() => setModalOpen(false)}
              >
                रद्द करें
              </Button>
              <Button
                type="submit"
                data-ocid="student.submit_button"
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingStudent ? "अपडेट करें" : "जोड़ें"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="students.delete_dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">छात्र हटाएं?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            क्या आप इस छात्र को स्थायी रूप से हटाना चाहते हैं? यह क्रिया वापस नहीं होगी।
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="students.cancel_button"
              onClick={() => setDeleteConfirmId(null)}
            >
              रद्द करें
            </Button>
            <Button
              variant="destructive"
              data-ocid="students.confirm_button"
              disabled={deleteStudent.isPending}
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              {deleteStudent.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              हटाएं
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
