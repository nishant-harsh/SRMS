const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose=require('passport-local-mongoose');

// Define the User schema
const UserSchema = new Schema({
  userId: String,
  email: String,
  role: { type: String, enum: ['examcell', 'teacher', 'student'] },
  subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }]
});
UserSchema.plugin(passportLocalMongoose);

// Define the Subject schema
const SubjectSchema = new Schema({
  name: String,
  teacher: { type: Schema.Types.ObjectId, ref: 'User' },
  students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  grades: [{ student: { type: Schema.Types.ObjectId, ref: 'User' }, grade: Number }]
});

// Define the Semester schema
const SemesterSchema = new Schema({
  name: String,
  subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }]
});

// Define the Result schema
const ResultSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User' },
  semester: { type: Schema.Types.ObjectId, ref: 'Semester' },
  cgpa: Number,
  grades: [{ subject: { type: Schema.Types.ObjectId, ref: 'Subject' }, grade: Number }]
});

// Export the models
module.exports = {
  User: mongoose.model('User', UserSchema),
  Subject: mongoose.model('Subject', SubjectSchema),
  Semester: mongoose.model('Semester', SemesterSchema),
  Result: mongoose.model('Result', ResultSchema)
};