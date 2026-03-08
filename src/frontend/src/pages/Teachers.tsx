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
import {
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Teacher } from "../backend.d";
import {
  useAddTeacher,
  useDeleteTeacher,
  useTeachers,
  useUpdateTeacher,
} from "../hooks/useQueries";

interface TeacherForm {
  name: string;
  subject: string;
  employeeId: string;
  contact: string;
}

const emptyForm: TeacherForm = {
  name: "",
  subject: "",
  employeeId: "",
  contact: "",
};

export default function Teachers() {
  const { data: teachers, isLoading, isError } = useTeachers();
  const addTeacher = useAddTeacher();
  const updateTeacher = useUpdateTeacher();
  const deleteTeacher = useDeleteTeacher();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState<TeacherForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<bigint | null>(null);

  const filtered = (teachers ?? []).filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditingTeacher(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setForm({
      name: teacher.name,
      subject: teacher.subject,
      employeeId: teacher.employeeId,
      contact: teacher.contact,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.subject || !form.employeeId) {
      toast.error("कृपया सभी आवश्यक फ़ील्ड भरें");
      return;
    }
    try {
      if (editingTeacher) {
        await updateTeacher.mutateAsync({ id: editingTeacher.id, ...form });
        toast.success("शिक्षक की जानकारी अपडेट हो गई");
      } else {
        await addTeacher.mutateAsync(form);
        toast.success("नए शिक्षक को जोड़ा गया");
      }
      setModalOpen(false);
      setForm(emptyForm);
    } catch {
      toast.error("कुछ गलत हुआ, पुनः प्रयास करें");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteTeacher.mutateAsync(id);
      toast.success("शिक्षक हटा दिया गया");
      setDeleteConfirmId(null);
    } catch {
      toast.error("हटाने में समस्या आई");
    }
  };

  const isPending = addTeacher.isPending || updateTeacher.isPending;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            शिक्षक प्रबंधन
          </h1>
          <p className="text-muted-foreground text-sm">
            Teacher Management — {teachers?.length ?? 0} शिक्षक
          </p>
        </div>
        <Button
          data-ocid="teachers.open_modal_button"
          onClick={openAdd}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          नए शिक्षक जोड़ें
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          data-ocid="teachers.search_input"
          placeholder="नाम, विषय या ID खोजें..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden bg-card">
        {isLoading ? (
          <div data-ocid="teachers.loading_state" className="p-6 space-y-3">
            {["s1", "s2", "s3", "s4"].map((k) => (
              <Skeleton key={k} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div
            data-ocid="teachers.error_state"
            className="p-10 text-center text-destructive"
          >
            <p className="font-medium">डेटा लोड करने में समस्या आई</p>
          </div>
        ) : filtered.length === 0 ? (
          <div data-ocid="teachers.empty_state" className="p-10 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-medium text-muted-foreground">
              {search ? "कोई परिणाम नहीं मिला" : "अभी कोई शिक्षक नहीं है"}
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              {search ? "खोज बदलकर देखें" : "ऊपर बटन से शिक्षक जोड़ें"}
            </p>
          </div>
        ) : (
          <Table data-ocid="teachers.table">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">नाम</TableHead>
                <TableHead className="font-semibold">विषय</TableHead>
                <TableHead className="font-semibold">कर्मचारी ID</TableHead>
                <TableHead className="font-semibold">संपर्क</TableHead>
                <TableHead className="font-semibold text-right">
                  कार्रवाई
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filtered.map((teacher, i) => (
                  <motion.tr
                    key={teacher.id.toString()}
                    data-ocid={`teachers.item.${i + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-purple-600">
                            {teacher.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-sm">
                          {teacher.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700">
                        {teacher.subject}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {teacher.employeeId}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {teacher.contact}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          data-ocid={`teachers.edit_button.${i + 1}`}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => openEdit(teacher)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          data-ocid={`teachers.delete_button.${i + 1}`}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                          onClick={() => setDeleteConfirmId(teacher.id)}
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
        <DialogContent className="sm:max-w-md" data-ocid="teachers.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingTeacher ? "शिक्षक जानकारी संपादित करें" : "नए शिक्षक जोड़ें"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="t-name">नाम *</Label>
                <Input
                  id="t-name"
                  data-ocid="teacher.name_input"
                  placeholder="शिक्षक का पूरा नाम"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="t-subject">विषय *</Label>
                <Input
                  id="t-subject"
                  data-ocid="teacher.subject_input"
                  placeholder="जैसे: गणित, हिंदी"
                  value={form.subject}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, subject: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="t-empid">कर्मचारी ID *</Label>
                <Input
                  id="t-empid"
                  data-ocid="teacher.employee_id_input"
                  placeholder="जैसे: TCH001"
                  value={form.employeeId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, employeeId: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="t-contact">संपर्क नंबर</Label>
                <Input
                  id="t-contact"
                  data-ocid="teacher.contact_input"
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
                data-ocid="teachers.cancel_button"
                onClick={() => setModalOpen(false)}
              >
                रद्द करें
              </Button>
              <Button
                type="submit"
                data-ocid="teacher.submit_button"
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingTeacher ? "अपडेट करें" : "जोड़ें"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="teachers.delete_dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">शिक्षक हटाएं?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            क्या आप इस शिक्षक को स्थायी रूप से हटाना चाहते हैं?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="teachers.cancel_button"
              onClick={() => setDeleteConfirmId(null)}
            >
              रद्द करें
            </Button>
            <Button
              variant="destructive"
              data-ocid="teachers.confirm_button"
              disabled={deleteTeacher.isPending}
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              {deleteTeacher.isPending && (
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
