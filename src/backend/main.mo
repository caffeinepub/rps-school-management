import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Include already implemented authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
    role : Text; // e.g., "Teacher", "Admin", "Staff"
    department : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Students Module
  type Student = {
    id : Nat;
    name : Text;
    grade : Text;
    rollNumber : Text;
    parentName : Text;
    contact : Text;
  };

  module Student {
    public func compare(student1 : Student, student2 : Student) : Order.Order {
      Nat.compare(student1.id, student2.id);
    };
  };

  // Teachers Module
  type Teacher = {
    id : Nat;
    name : Text;
    subject : Text;
    employeeId : Text;
    contact : Text;
  };

  // Attendance Module
  type Attendance = {
    studentId : Nat;
    date : Time.Time;
    status : { #present; #absent; #late };
  };

  module Attendance {
    public func compare(attendance1 : Attendance, attendance2 : Attendance) : Order.Order {
      Nat.compare(attendance1.studentId, attendance2.studentId);
    };
  };

  // Results Module
  type Result = {
    studentId : Nat;
    examName : Text;
    subject : Text;
    marksObtained : Nat;
    totalMarks : Nat;
  };

  // Fees Module
  type FeeRecord = {
    studentId : Nat;
    feeType : Text;
    amountDue : Nat;
    amountPaid : Nat;
    paymentDate : ?Time.Time;
    status : { #paid; #pending };
  };

  // Dashboard Types
  public type DashboardStats = {
    totalStudents : Nat;
    totalTeachers : Nat;
    todayPresentCount : Nat;
    todayAbsentCount : Nat;
    todayLateCount : Nat;
  };

  var studentIdCounter = 0;
  var teacherIdCounter = 0;

  let students = Map.empty<Nat, Student>();
  let teachers = Map.empty<Nat, Teacher>();
  let attendanceRecords = Map.empty<Nat, [Attendance]>();
  let resultsRecords = Map.empty<Nat, [Result]>();
  let feeRecords = Map.empty<Nat, [FeeRecord]>();

  // Student Functions
  public shared ({ caller }) func addStudent(name : Text, grade : Text, rollNumber : Text, parentName : Text, contact : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add students");
    };

    studentIdCounter += 1;
    let student : Student = {
      id = studentIdCounter;
      name;
      grade;
      rollNumber;
      parentName;
      contact;
    };
    students.add(studentIdCounter, student);
    studentIdCounter;
  };

  public shared ({ caller }) func updateStudent(id : Nat, name : Text, grade : Text, rollNumber : Text, parentName : Text, contact : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update students");
    };

    let student : Student = {
      id;
      name;
      grade;
      rollNumber;
      parentName;
      contact;
    };
    students.add(id, student);
    true;
  };

  public shared ({ caller }) func deleteStudent(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete students");
    };
    students.remove(id);
    true;
  };

  public query ({ caller }) func listStudents() : async [Student] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list students");
    };
    students.values().toArray().sort();
  };

  // Teacher Functions
  public shared ({ caller }) func addTeacher(name : Text, subject : Text, employeeId : Text, contact : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add teachers");
    };

    teacherIdCounter += 1;
    let teacher : Teacher = {
      id = teacherIdCounter;
      name;
      subject;
      employeeId;
      contact;
    };
    teachers.add(teacherIdCounter, teacher);
    teacherIdCounter;
  };

  public shared ({ caller }) func updateTeacher(id : Nat, name : Text, subject : Text, employeeId : Text, contact : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update teachers");
    };

    let teacher : Teacher = {
      id;
      name;
      subject;
      employeeId;
      contact;
    };
    teachers.add(id, teacher);
    true;
  };

  public shared ({ caller }) func deleteTeacher(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete teachers");
    };
    teachers.remove(id);
    true;
  };

  public query ({ caller }) func listTeachers() : async [Teacher] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list teachers");
    };
    teachers.values().toArray();
  };

  // Attendance Functions
  public shared ({ caller }) func markAttendance(studentId : Nat, date : Time.Time, status : { #present; #absent; #late }) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark attendance");
    };

    let attendance = {
      studentId;
      date;
      status;
    };

    let existingRecords = switch (attendanceRecords.get(studentId)) {
      case (null) { [] };
      case (?records) { records };
    };

    let newRecords = existingRecords.concat([attendance]);
    attendanceRecords.add(studentId, newRecords);
    true;
  };

  public query ({ caller }) func getAttendanceByDate(date : Time.Time) : async [Attendance] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view attendance");
    };

    let allRecordsIter = attendanceRecords.values();
    var allRecords = ([] : [Attendance]);
    for (records in allRecordsIter) {
      allRecords := allRecords.concat(records);
    };
    allRecords.filter(func(attendance) { attendance.date == date });
  };

  public query ({ caller }) func getAttendanceByStudent(studentId : Nat) : async [Attendance] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view attendance");
    };
    switch (attendanceRecords.get(studentId)) {
      case (null) { [] };
      case (?records) { records };
    };
  };

  // Results Functions
  public shared ({ caller }) func addResult(studentId : Nat, examName : Text, subject : Text, marksObtained : Nat, totalMarks : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add results");
    };

    let result : Result = {
      studentId;
      examName;
      subject;
      marksObtained;
      totalMarks;
    };

    let existingResults = switch (resultsRecords.get(studentId)) {
      case (null) { [] };
      case (?results) { results };
    };

    let newResults = existingResults.concat([result]);
    resultsRecords.add(studentId, newResults);
    true;
  };

  public query ({ caller }) func getResultsByStudent(studentId : Nat) : async [Result] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view results");
    };
    switch (resultsRecords.get(studentId)) {
      case (null) { [] };
      case (?results) { results };
    };
  };

  // Fees Functions
  public shared ({ caller }) func addFeeRecord(studentId : Nat, feeType : Text, amountDue : Nat, amountPaid : Nat, paymentDate : ?Time.Time, status : { #paid; #pending }) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add fee records");
    };

    let feeRecord : FeeRecord = {
      studentId;
      feeType;
      amountDue;
      amountPaid;
      paymentDate;
      status;
    };

    var existingRecords : [FeeRecord] = [];

    switch (feeRecords.get(studentId)) {
      case (null) { existingRecords := [] };
      case (?records) { existingRecords := records };
    };

    let newRecords : [FeeRecord] = existingRecords.concat([feeRecord]);
    feeRecords.add(studentId, newRecords);
    true;
  };

  public query ({ caller }) func getFeeRecordsByStudent(studentId : Nat) : async [FeeRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view fee records");
    };
    switch (feeRecords.get(studentId)) {
      case (null) { [] };
      case (?records) { records };
    };
  };

  // Dashboard Function
  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard");
    };

    let totalStudents = students.size();
    let totalTeachers = teachers.size();

    // Get today's timestamp (approximate - using current time)
    let now = Time.now();
    // Calculate start of today (this is approximate, in production you'd want proper date handling)
    let oneDayNanos : Int = 24 * 60 * 60 * 1_000_000_000;
    let todayStart = now - (now % oneDayNanos);

    var presentCount = 0;
    var absentCount = 0;
    var lateCount = 0;

    for (records in attendanceRecords.values()) {
      for (attendance in records.vals()) {
        if (attendance.date >= todayStart and attendance.date < todayStart + oneDayNanos) {
          switch (attendance.status) {
            case (#present) { presentCount += 1 };
            case (#absent) { absentCount += 1 };
            case (#late) { lateCount += 1 };
          };
        };
      };
    };

    {
      totalStudents;
      totalTeachers;
      todayPresentCount = presentCount;
      todayAbsentCount = absentCount;
      todayLateCount = lateCount;
    };
  };
};
