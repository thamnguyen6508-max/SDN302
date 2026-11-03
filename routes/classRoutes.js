const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Class = require('../model/Class');
const Student = require('../model/Student');
const Attendance = require('../model/Attendance');
const { verifyToken } = require('../middlewares/auth');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getStudentsInClass = async (req, res) => {
  try {
    const classId = req.params.classId || req.params.classID;

    if (!isValidId(classId)) {
      return res.status(400).json({ message: 'Invalid classId' });
    }

    const foundClass = await Class.findById(classId).populate('enrollments.studentId');
    if (!foundClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    let statusQuery = req.query.status;
    if (statusQuery === undefined) {
      statusQuery = 'enrolled';
    }

    if (typeof statusQuery !== 'string') {
      return res.status(400).json({ message: 'Invalid status parameter' });
    }

    const normalizedStatus = statusQuery.trim().toLowerCase();
    if (normalizedStatus !== 'enrolled' && normalizedStatus !== 'dropped') {
      return res.status(400).json({ message: 'Status must be enrolled or dropped' });
    }

    const matchingEnrollments = (foundClass.enrollments || []).filter(e =>
      e.status && e.status.toLowerCase() === normalizedStatus
    );

    const studentList = [];
    for (const e of matchingEnrollments) {
      if (e.studentId) {
        studentList.push({
          studentId: e.studentId._id,
          studentCode: e.studentId.studentCode,
          fullName: e.studentId.fullName,
          email: e.studentId.email
        });
      }
    }

    return res.status(200).json(studentList);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

router.get('/:classId/students', verifyToken, getStudentsInClass);
router.get('/:classId/student', verifyToken, getStudentsInClass);

const getAttendanceSummary = async (req, res) => {
  try {
    const classId = req.params.classId || req.params.classID;

    if (!isValidId(classId)) {
      return res.status(300).json({ message: 'Invalid classId' });
    }

    const targetClass = await Class.findById(classId).populate('enrollments.studentId');
    if (!targetClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const enrolledList = (targetClass.enrollments || []).filter(e =>
      e.status && e.status.toLowerCase() === 'enrolled'
    );

    const summaryResult = [];

    for (const enrollment of enrolledList) {
      const studentObj = enrollment.studentId;
      const studentId = studentObj ? (studentObj._id || studentObj) : enrollment.studentId;

      const attendances = await Attendance.find({
        classId: targetClass._id,
        studentId: studentId
      });

      const totalSessions = attendances.length;
      let present = 0;
      let absent = 0;

      for (const a of attendances) {
        const s = (a.status || '').toUpperCase();
        if (s === 'PRESENT') {
          present++;
        } else if (s === 'ABSENT') {
          absent++;
        }
      }

      let attendanceRate = 0;
      let warning = true;

      if (totalSessions > 0) {
        attendanceRate = Number(((present / totalSessions) * 100).toFixed(1));
        warning = attendanceRate < 80;
      } else {
        present = 0;
        absent = 0;
        attendanceRate = 0;
        warning = true;
      }

      summaryResult.push({
        studentId: studentId,
        studentCode: studentObj?.studentCode || '',
        fullName: studentObj?.fullName || '',
        totalSessions: totalSessions,
        present: present,
        absent: absent,
        attendanceRate: attendanceRate,
        warning: warning
      });
    }

    return res.status(200).json(summaryResult);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

router.get('/:classId/attendance-summary', verifyToken, getAttendanceSummary);
router.get('/:classID/attendance-summary', verifyToken, getAttendanceSummary);

const upsertClassAttendances = async (req, res) => {
  try {
    const classId = req.params.classId || req.params.classID;

    if (!isValidId(classId)) {
      return res.status(400).json({ message: 'Invalid classId' });
    }

    const targetClass = await Class.findById(classId);
    if (!targetClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const { date, records } = req.body;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const attendanceDate = new Date(date);
    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const now = new Date();
    if (attendanceDate > now) {
      return res.status(400).json({ message: 'Date cannot be in the future' });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'Records must be a non-empty array' });
    }

    const enrolledStudents = (targetClass.enrollments || []).filter(e =>
      e.status && e.status.toLowerCase() === 'enrolled'
    );
    const enrolledStudentIdSet = new Set(
      enrolledStudents.map(e => e.studentId.toString())
    );

    const recordStudentIdSet = new Set();
    for (const r of records) {
      if (!r || !r.studentId || !isValidId(r.studentId)) {
        return res.status(400).json({ message: `Invalid studentId in records` });
      }

      const sId = r.studentId.toString();
      if (!enrolledStudentIdSet.has(sId)) {
        return res.status(400).json({ message: `Student ${sId} is not enrolled in this class` });
      }

      if (r.status !== 'PRESENT' && r.status !== 'ABSENT') {
        return res.status(400).json({ message: 'Status must be either PRESENT or ABSENT' });
      }

      recordStudentIdSet.add(sId);
    }

    if (recordStudentIdSet.size !== enrolledStudentIdSet.size || records.length !== enrolledStudentIdSet.size) {
      return res.status(400).json({
        message: 'The request must include attendance records for all students currently enrolled in that class'
      });
    }

    const startOfDay = new Date(attendanceDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(attendanceDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    for (const r of records) {
      const existing = await Attendance.findOne({
        classId: targetClass._id,
        studentId: r.studentId,
        date: { $gte: startOfDay, $lte: endOfDay }
      });

      if (existing) {
        existing.status = r.status;
        await existing.save();
      } else {
        await Attendance.create({
          classId: targetClass._id,
          studentId: r.studentId,
          date: attendanceDate,
          status: r.status
        });
      }
    }

    return res.status(200).json({
      message: 'Attendance records created or updated successfully'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

router.post('/:classId/attendances', upsertClassAttendances);
router.post('/:classId/attendance', upsertClassAttendances);

module.exports = router;
