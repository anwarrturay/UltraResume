const Resume = require("../models/Resume");
const asyncHandler = require('express-async-handler');
const MyResumes = require("../models/MyResumes");
const cloudinary = require("../config/cloudinary");
const { v4: uuidv4 } = require('uuid'); 
const fs = require("fs")
require("dotenv").config();

const getAllResumes = async (req, res) => {
    const resumes = await Resume.find();
    if (!resumes || resumes.length === 0) return res.status(204).json({ message: "No Available resumes found" });
    res.json(resumes);
}

const createNewResume = asyncHandler(async (req, res) => {
    const { personalDetails, experience, education, skills, summary, projects, certifications, languages, references, hobbies} = req.body;

    const userId = req.params?.id
    if(!userId) return res.status(404).json({message: "User Id Not Found"});

    if ( !personalDetails || !experience || !education || !skills || !summary || !projects || !certifications || !languages || !references || !hobbies) {
        return res.status(400).json({ message: "All required fields must be provided" });
    }

    if (!req.file) {
        return res.status(400).json({ message: "No uploaded file" });
    }

    const parsedDob = new Date(personalDetails.dob);
    if (isNaN(parsedDob.getTime())) {
        return res.status(400).json({ message: "Invalid date format for DOB" });
    }

    const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "wokpepa-resumeprofiles",
        public_id: uuidv4(),
    });
    const parsedExperience = JSON.parse(experience)
    const parsedEducation = JSON.parse(education)
    const parsedProjects = JSON.parse(projects)
    const parsedCertifications = JSON.parse(certifications)
    const parsedReferences = JSON.parse(references)
    const parsedLanguages = JSON.parse(languages)

    try {
        const newResume = new Resume({
            userId,
            personalDetails: {
                title: personalDetails.title,
                name: personalDetails.name,
                email: personalDetails.email,
                phone: personalDetails.phone,
                address: personalDetails.address,
                dob: parsedDob,
                country: personalDetails.country,
                nationality: personalDetails.nationality,
            },
            experience: parsedExperience.map(exp => ({
                jobTitle: exp.jobTitle,
                company: exp.company,
                startDate: exp.startDate,
                endDate: exp.endDate,
                responsibilities: exp.responsibilities || ""
            })),
            education: parsedEducation.map(edu => ({
                level: edu.level,
                school: edu.school,
                startDate: edu.startDate,
                endDate: edu.endDate,
                degree: edu.degree || ""
            })), 
            projects: parsedProjects.map(project => ({
                title: project.title,
                description: project.description,
            })),
            certifications: parsedCertifications.map(cert => ({
                name: cert.name,
                issuingOrganization: cert.issuingOrganization,
                issueDate: cert.issueDate
            })),
            languages: parsedLanguages || "", 
            references: parsedReferences || "",
            hobbies: hobbies || "", 
            summary: summary || "",
            skills: skills || "",
            image: cloudinaryResult.secure_url,
            cloudinaryId: cloudinaryResult.public_id
        });
        const savedResume = await newResume.save();
        const resumeUrl = `${process.env.CLIENT_URL}/resumes/${savedResume._id}`;
        savedResume.resumeUrl = resumeUrl;
        await savedResume.save();

        return res.status(201).json({ 
            message: "Resume created successfully", 
            resumeUrl, 
            savedResume 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

const getSpecificResume = asyncHandler(async(req, res)=>{
    const resumeId  = req?.params?.id;
    if(!resumeId) return res.status(404).json({message: `Resume Id not found `});
    console.log("ResumeId: ", resumeId);
    try{
        const foundResumeData = await Resume.findById({_id:resumeId}).exec();
        if(!foundResumeData) return res.status(404).json({message: "No Resume not found in DB"});
        return res.status(200).json(foundResumeData);
    }catch(err){
        console.error("error getting resume", err?.message)
    }
})

const updateResume = async (req, res) => {
    const resumeId = req?.params?.id;
    if (!resumeId) {
        return res.status(400).json({ message: "ID parameter is required" });
    }

    try {
        const resume = await Resume.findById(resumeId);
        if (!resume) {
            return res.status(404).json({ message: `No resume matches the ID: ${resumeId}` });
        }

        if (req.body.personalDetails) {
            resume.personalDetails = {
                ...resume.personalDetails,
                ...req.body.personalDetails
            };
        }

        if (req.body.summary) {
            resume.summary = req.body.summary;
        }

        if (Array.isArray(req.body.experience)) {
            resume.experience = req.body.experience;
        }

        if (Array.isArray(req.body.education)) {
            resume.education = req.body.education;
        }

        if (Array.isArray(req.body.skills)) {
            resume.skills = req.body.skills;
        }

        if (Array.isArray(req.body.projects)) {
            resume.projects = req.body.projects;
        }

        if (Array.isArray(req.body.certifications)) {
            resume.certifications = req.body.certifications;
        }

        if (Array.isArray(req.body.languages)) {
            resume.languages = req.body.languages;
        }

        if (Array.isArray(req.body.references)) {
            resume.references = req.body.references;
        }

        if (Array.isArray(req.body.hobbies)) {
            resume.hobbies = req.body.hobbies;
        }

        if (req.file) {
            try {
                // Upload new image to Cloudinary
                const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
                    folder: "wokpepa-resumeprofiles",
                    public_id: uuidv4()
                });

                // Delete old image from Cloudinary if it exists
                if (resume.cloudinaryId) {
                    try {
                        await cloudinary.uploader.destroy(resume.cloudinaryId);
                    } catch (cloudinaryError) {
                        console.error("Error deleting old image from Cloudinary:", cloudinaryError);
                        // Continue execution even if delete fails
                    }
                }

                // Clean up local file after successful upload
                fs.unlinkSync(req.file.path);

                // Update with new image details
                resume.image = cloudinaryResult.secure_url;
                resume.cloudinaryId = cloudinaryResult.public_id;
            } catch (uploadError) {
                // Clean up local file if upload fails
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                throw new Error(`Image upload failed: ${uploadError.message}`);
            }
        }
        const updatedResume = await resume.save();

        return res.status(200).json({
            message: "Resume updated successfully",
            data: updatedResume
        });

    } catch (error) {
        console.error("Error updating resume:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const deleteResume = async (req, res) => {
    const resumeId = req?.params?.id;
    if (!resumeId) return res.status(400).json({ message: "Resume Id required" });

    try{
        const resume = await Resume.findById({ _id:resumeId }).exec();
        if (!resume) return res.status(204).json({ message: "Resume not found" });
        
        const result = await resume.deleteOne({ _id: req.params.id }).exec();
        res.status(204).json({message: "Resume deleted Successfully", result});
    }catch(err){
        console.error("Error Deleting Resume: ", err);
        return res.status(500).json({ 
            message: "Error Deleting resume", 
            error: err.message 
        });
    }
}

const savedResume = asyncHandler(async (req, res) => {
    const userId = req.params?.id;
    const { resumeId } = req.body;
    
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    if (!resumeId) {
        return res.status(400).json({ message: "Resume ID is required" });
    }
    
    try {
        const resume = await Resume.findById(resumeId);
        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }
        let myResumes = await MyResumes.findOne({ userId });
        
        if (!myResumes) {
            myResumes = new MyResumes({
                userId,
                savedResumes: [resumeId]
            });
        } else {
            if (myResumes.savedResumes.includes(resumeId)) {
                return res.status(400).json({ message: "Resume already saved" });
            }
            myResumes.savedResumes.push(resumeId);
        }

        await myResumes.save();

        const populatedMyResumes = await MyResumes.findById(myResumes._id)
        .populate('savedResumes');
        
        res.status(200).json({
            message: "Resume saved successfully",
            savedResumes: populatedMyResumes
        });
    } catch (error) {
        console.error("Error saving resume:", error);
        res.status(500).json({
            message: "Failed to save resume",
            error: error.message
        });
    }
});

const getUserResumes = async (req, res) => {
    const userId = req?.params?.id;
    if(!userId) {
        return res.status(404).json({ message: "User Id not found" });
    }
    
    try {
        const foundUser = await MyResumes.findOne({ userId })
            .populate({
                path: 'savedResumes',
                select: 'personalDetails summary experience education skills projects certifications languages references hobbies image createdAt updatedAt',
                options: { sort: { createdAt: -1 } } // Sort by newest first
            });

        if(!foundUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if(!foundUser.savedResumes?.length) {
            return res.status(200).json([]); 
        }

        return res.status(200).json(foundUser.savedResumes);
    } catch(err) {
        console.error("Error fetching user resumes:", err);
        return res.status(500).json({ 
            message: "Error fetching resumes", 
            error: err.message 
        });
    }
};

module.exports = {
    getAllResumes,
    createNewResume,
    updateResume,
    deleteResume,
    savedResume,
    getUserResumes,
    getSpecificResume
};
