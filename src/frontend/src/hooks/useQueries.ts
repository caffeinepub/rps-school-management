import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Variant_pending_paid,
  Variant_present_late_absent,
} from "../backend.d";
import { useActor } from "./useActor";

// Re-export enums for convenience
export { Variant_pending_paid, Variant_present_late_absent };

// Helper to convert JS Date string to nanosecond bigint
export function dateToNano(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * 1_000_000n;
}

export function todayNano(): bigint {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return BigInt(startOfDay.getTime()) * 1_000_000n;
}

export function nanoToDate(nano: bigint): string {
  const ms = Number(nano / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-IN");
}

// =====================
// Students
// =====================
export function useStudents() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listStudents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      grade: string;
      rollNumber: string;
      parentName: string;
      contact: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addStudent(
        data.name,
        data.grade,
        data.rollNumber,
        data.parentName,
        data.contact,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useUpdateStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      grade: string;
      rollNumber: string;
      parentName: string;
      contact: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateStudent(
        data.id,
        data.name,
        data.grade,
        data.rollNumber,
        data.parentName,
        data.contact,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useDeleteStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteStudent(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

// =====================
// Teachers
// =====================
export function useTeachers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTeachers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTeacher() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      subject: string;
      employeeId: string;
      contact: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addTeacher(
        data.name,
        data.subject,
        data.employeeId,
        data.contact,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });
}

export function useUpdateTeacher() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      subject: string;
      employeeId: string;
      contact: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateTeacher(
        data.id,
        data.name,
        data.subject,
        data.employeeId,
        data.contact,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });
}

export function useDeleteTeacher() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteTeacher(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });
}

// =====================
// Attendance
// =====================
export function useAttendanceByDate(date: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["attendance", "date", date],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAttendanceByDate(dateToNano(date));
    },
    enabled: !!actor && !isFetching && !!date,
  });
}

export function useAttendanceByStudent(studentId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["attendance", "student", studentId?.toString()],
    queryFn: async () => {
      if (!actor || studentId === null) return [];
      return actor.getAttendanceByStudent(studentId);
    },
    enabled: !!actor && !isFetching && studentId !== null,
  });
}

export function useMarkAttendance() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      records: Array<{
        studentId: bigint;
        date: string;
        status: Variant_present_late_absent;
      }>,
    ) => {
      if (!actor) throw new Error("No actor");
      await Promise.all(
        records.map((r) =>
          actor.markAttendance(r.studentId, dateToNano(r.date), r.status),
        ),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

// =====================
// Results
// =====================
export function useResultsByStudent(studentId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["results", studentId?.toString()],
    queryFn: async () => {
      if (!actor || studentId === null) return [];
      return actor.getResultsByStudent(studentId);
    },
    enabled: !!actor && !isFetching && studentId !== null,
  });
}

export function useAddResult() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      studentId: bigint;
      examName: string;
      subject: string;
      marksObtained: number;
      totalMarks: number;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addResult(
        data.studentId,
        data.examName,
        data.subject,
        BigInt(data.marksObtained),
        BigInt(data.totalMarks),
      );
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({
        queryKey: ["results", vars.studentId.toString()],
      }),
  });
}

// =====================
// Fee Records
// =====================
export function useFeeRecordsByStudent(studentId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["fees", studentId?.toString()],
    queryFn: async () => {
      if (!actor || studentId === null) return [];
      return actor.getFeeRecordsByStudent(studentId);
    },
    enabled: !!actor && !isFetching && studentId !== null,
  });
}

export function useAddFeeRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      studentId: bigint;
      feeType: string;
      amountDue: number;
      amountPaid: number;
      paymentDate: string | null;
      status: Variant_pending_paid;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addFeeRecord(
        data.studentId,
        data.feeType,
        BigInt(data.amountDue),
        BigInt(data.amountPaid),
        data.paymentDate ? dateToNano(data.paymentDate) : null,
        data.status,
      );
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["fees", vars.studentId.toString()] }),
  });
}

// =====================
// Dashboard
// =====================
export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
