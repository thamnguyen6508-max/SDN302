const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Student = require('../model/Student');
const Attendance = require('../model/Attendance');
const Class = require('../model/Class');
const Subject = require('../model/Subject');
const { verifyToken } = require('../middlewares/auth');

const getStudentAttendances = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'Invalid studentId' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const attendances = await Attendance.find({ studentId: student._id })
      .populate({
        path: 'classId',
        populate: {
          path: 'subjectId'
        }
      })
      .sort({ date: -1 });

    const result = attendances.map(a => ({
      className: a.classId ? a.classId.className : '',
      subjectName: a.classId && a.classId.subjectId ? a.classId.subjectId.name : '',
      date: a.date,
      status: a.status
    }));

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

router.get('/:studentId/attendances', verifyToken, getStudentAttendances);
router.get('/:studentId/attendance', verifyToken, getStudentAttendances);

module.exports = router;
