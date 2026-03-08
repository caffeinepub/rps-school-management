import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface FeeRecord {
    status: Variant_pending_paid;
    studentId: bigint;
    feeType: string;
    amountPaid: bigint;
    paymentDate?: Time;
    amountDue: bigint;
}
export type Time = bigint;
export interface Result {
    totalMarks: bigint;
    studentId: bigint;
    subject: string;
    marksObtained: bigint;
    examName: string;
}
export interface Attendance {
    status: Variant_present_late_absent;
    studentId: bigint;
    date: Time;
}
export interface Teacher {
    id: bigint;
    contact: string;
    subject: string;
    name: string;
    employeeId: string;
}
export interface DashboardStats {
    todayAbsentCount: bigint;
    todayLateCount: bigint;
    totalStudents: bigint;
    totalTeachers: bigint;
    todayPresentCount: bigint;
}
export interface UserProfile {
    name: string;
    role: string;
    department?: string;
}
export interface Student {
    id: bigint;
    contact: string;
    name: string;
    grade: string;
    rollNumber: string;
    parentName: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_paid {
    pending = "pending",
    paid = "paid"
}
export enum Variant_present_late_absent {
    present = "present",
    late = "late",
    absent = "absent"
}
export interface backendInterface {
    addFeeRecord(studentId: bigint, feeType: string, amountDue: bigint, amountPaid: bigint, paymentDate: Time | null, status: Variant_pending_paid): Promise<boolean>;
    addResult(studentId: bigint, examName: string, subject: string, marksObtained: bigint, totalMarks: bigint): Promise<boolean>;
    addStudent(name: string, grade: string, rollNumber: string, parentName: string, contact: string): Promise<bigint>;
    addTeacher(name: string, subject: string, employeeId: string, contact: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteStudent(id: bigint): Promise<boolean>;
    deleteTeacher(id: bigint): Promise<boolean>;
    getAttendanceByDate(date: Time): Promise<Array<Attendance>>;
    getAttendanceByStudent(studentId: bigint): Promise<Array<Attendance>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getFeeRecordsByStudent(studentId: bigint): Promise<Array<FeeRecord>>;
    getResultsByStudent(studentId: bigint): Promise<Array<Result>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listStudents(): Promise<Array<Student>>;
    listTeachers(): Promise<Array<Teacher>>;
    markAttendance(studentId: bigint, date: Time, status: Variant_present_late_absent): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateStudent(id: bigint, name: string, grade: string, rollNumber: string, parentName: string, contact: string): Promise<boolean>;
    updateTeacher(id: bigint, name: string, subject: string, employeeId: string, contact: string): Promise<boolean>;
}
