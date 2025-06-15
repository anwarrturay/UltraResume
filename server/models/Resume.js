const mongoose = require("mongoose");
const { Schema } = mongoose;

const ResumeSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    personalDetails: {
      title: { type: String, required: true, trim: true },
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      phone: { type: Number, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      nationality: {type: String, required:true, trim:true},
      dob: {
        type: Date,
        required: true,
        validate: {
          validator: function (value) {
            return value instanceof Date && !isNaN(value);
          },
          message: "Invalid date format",
        },
      },
      country: { type: String, required: true, trim: true },
      
    },
    summary: {
      type: String,
      required:true,
      trim: true,
    },
    experience: [
      {
        jobTitle: { type: String, required:true, trim: true },
        company: { type: String, required:true, trim: true },
        startDate: { type: String, required:true, },
        endDate: { type: String, required:true, },
        responsibilities: { type: String, required:true, trim: true },
      },
    ],
    education: [
      {
        level: { type: String, required: true, trim: true },
        school: { type: String, required: true, trim: true },
        startDate: { type: String, required: true },
        endDate: { type: String, required: true },
        degree: { type: String, trim: true },
      },
    ],
    skills: [{ type: String, trim: true }],
    projects: [
      {
        title: { type: String, required:true, trim: true },
        description: { type: String, required:true, trim: true },
      },
    ],
    certifications: [
      {
        name: { type: String, required:true,  trim: true },
        issuingOrganization: { type: String, required:true,  trim: true },
        issueDate: { type: String, required:true,},
      },
    ],
    languages: [{ 
      name: {type: String, trim: true },
      level: {type: String, trim: true }
    }],
    references: [
      {
        name: { type: String, required:true, trim: true },
        position: { type: String, required:true, trim: true },
        contact: { type: String, required:true, trim: true },
      },
    ],
    hobbies: [{ type: String, trim: true }],
    image: {
      type: String,
      required: true
    },
    resumeUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", ResumeSchema);
