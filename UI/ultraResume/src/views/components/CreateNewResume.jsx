import { useState, useRef } from "react";
import {useNavigate} from "react-router";
import PersonalDetails from "./new-resume/PersonalDetails";
import Experience from "./new-resume/Experience";
import Skills from "./new-resume/Skills";
import Education from "./new-resume/Education";
import Summary from "./new-resume/Summary"
import Projects from "./new-resume/Projects";
import Certifications from "./new-resume/Certifications";
import Languages from "./new-resume/Languages"
import Hobbies from "./new-resume/Hobbies"
import References from "./new-resume/References";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import { LoaderCircle, X, Download, Save, CheckCheck, LoaderPinwheel, Plus } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import MyDocument from "./new-resume/resumepdf/MyDocument";
import NewResumeHeader from "./new-resume/NewResumeHeader";
import PDFPreview from "./new-resume/resumepdf/PDFPreview";
const CreateNewResume = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const userId = auth?.userId;
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resumeGenerated, setResumeGenerated] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [resumeId, setResumeId] = useState("");
  const canvasRef = useRef(null)
  const [pdfReady, setPdfReady] = useState(false); 
  const [formData, setFormData] = useState({
    personalDetails: {
      title: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      nationality: "",
      dob: "",
      country: ""
    },
    summary: "",
    experience: [{
      jobTitle: "",
      company: "",
      responsibilities: "",
      startDate: "",
      endDate: "",
    }],
    education: [{
      level: "",
      school: "",
      degree: "",
      startDate: "",
      endDate: ""
    }],
    projects: [{
      title: "",
      description: "",
    }],
    certifications: [{ 
      name: "",
      issuingOrganization: "",
      issueDate: "",
    }],
    languages: [],
    references: [{
      name: "",
      position: "",
      contact: ""
    }], 
    hobbies: [],
    skills: [],
    image: null
  });

  const [selectedFile, setSelectedFile] = useState("");

  const handleChange = (section, field, value) => {
    if (section === "image") {
      setFormData(prev => ({
        ...prev,
        image: value
      }));
    } else if (section === "summary") {
      setFormData(prev => {
        return ({
        ...prev,
        summary: value
      })
    });
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();

    if(formData.image){
      formDataToSend.append('image', formData.image);
    }

    Object.keys(formData.personalDetails).forEach((key) => {
      formDataToSend.append(`personalDetails[${key}]`, formData.personalDetails[key]);
    });

    formDataToSend.append('summary', formData.summary);
    formDataToSend.append('experience', JSON.stringify(formData.experience));
    formDataToSend.append('education', JSON.stringify(formData.education));
    formDataToSend.append('skills', formData.skills);
    formDataToSend.append('projects', JSON.stringify(formData.projects));
    formDataToSend.append('certifications', JSON.stringify(formData.certifications));
    formDataToSend.append('languages', JSON.stringify(formData.languages));
    formDataToSend.append('references', JSON.stringify(formData.references));
    formDataToSend.append('hobbies', formData.hobbies);


    try {
      const response = await axiosPrivate.post(
        `/resumes/${userId}`, 
        formDataToSend,
        {headers:{"Content-Type": "multipart/form-data"}}
      );
      setResumeId(response?.data?.savedResume?._id);

      if (response.status === 201) {
        setResumeGenerated(true);
        setShowForm(false);
      }
    } catch (err) {
      console.error("Unable to create a new resume", err);
      alert("Failed to create resume. Please try again.");
    }finally{
      setLoading(false)
    }
  };

  const SaveResume = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await axiosPrivate.post(
        `resumes/my-resumes/${userId}`,
        { resumeId }
      );
      
      if (response.status === 200) {
        setSaved(true)
      }
    } catch (err) {
      console.error("Error saving resume:", err);
      alert(err.response?.data?.message || "Unable to save resume");
    } finally {
      setIsSaving(false);
    }
  };

  const onPdfReady = () => {
    setPdfReady(true);
  };


  return (
    <div className="min-h-screen bg-gray-50 font-montserrat">
      {/* Header */}
        <NewResumeHeader />
      {/* Add padding to account for fixed header */}
      <div className="pt-12 sm:pt-16">
        {showForm && (
          <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <PersonalDetails 
                    handleChange={handleChange} 
                    formData={formData}
                    setStep={() => {}}
                  />
                </div>
              </div>

              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <Summary 
                    handleChange={handleChange} 
                    formData={formData} 
                    setStep={() => {}}
                  />
                </div>
              </div>

              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <Experience 
                    handleChange={handleChange} 
                    formData={formData} 
                    setFormData={setFormData} 
                    setStep={() => {}}
                  />
                </div>
              </div>

              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <Education 
                    handleChange={handleChange} 
                    formData={formData} 
                    setFormData={setFormData} 
                    setStep={() => {}}
                  />
                </div>
              </div>

              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <Skills 
                    formData={formData} 
                    setFormData={setFormData} 
                    setStep={() => {}}
                  />
                </div>
              </div>

              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <Projects 
                    handleChange={handleChange} 
                    formData={formData} 
                    setFormData={setFormData} 
                    setStep={() => {}}
                  />
                </div>
              </div>

              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <Certifications 
                    handleChange={handleChange} 
                    formData={formData} 
                    setFormData={setFormData} 
                    setStep={() => {}}
                  />
                </div>
              </div>

              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <Languages 
                    formData={formData} 
                    setFormData={setFormData} 
                    setStep={() => {}}
                  />
                </div>
              </div>

              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <References 
                    handleChange={handleChange} 
                    formData={formData} 
                    setFormData={setFormData} 
                    setStep={() => {}}
                  />
                </div>
              </div>

              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <Hobbies 
                    formData={formData} 
                    setFormData={setFormData} 
                    setStep={() => {}}
                  />
                </div>
              </div>

              <div className="flex justify-end pb-8">
                <button
                  type="submit"
                  className={`${loading ? "bg-gray-500" : "bg-[#2A5D9E]"} text-white px-4 py-2 rounded-sm cursor-pointer`}
                >
                  {loading ? 
                    <div className="flex items-center justify-center text-white">
                      <LoaderPinwheel className="animate-spin"/>
                      <p className="ml-2">Generating...</p>
                    </div> : 
                    <div className="flex items-center">                    
                      <Plus size={20} strokeWidth={3} className="mr-2"/>
                      <p>Create Resume</p>
                    </div>
                  }
                </button>
              </div>
            </form>
          </main>
        )}

        {/* Resume Generated */}
        {resumeGenerated && !showForm && (
          <div className="relative w-full min-h-screen bg-gray-50 py-4 sm:py-8 mt-8 sm:mt-12">
            <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 space-y-4 sm:space-y-6">
              <div className="relative p-2 sm:p-4">
                <button
                  onClick={() => {
                    setSaved(false)
                    setShowForm(true)
                    setPdfReady(false)
                    setResumeGenerated(false);
                  }}
                  className="absolute -right-1 sm:-right-3 -top-2 sm:-top-3 p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors cursor-pointer z-10"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>

                {!pdfReady && (
                  <div className="flex items-center justify-center p-10 text-gray-600">
                    <LoaderCircle className="animate-spin mr-2" />
                    <p>Preparing Resume Preview...</p>
                  </div>
                )}
                
                <div className={pdfReady ? "block" : "hidden"}>
                  <PDFPreview formData={formData} onReady={onPdfReady} />
                  <p className="text-sm mt-2 font-semibold text-gray-500">Click Download to see full resume</p>
                </div>
              </div>

              {/* Buttons below PDF */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 px-2">
                {pdfReady && (
                  <PDFDownloadLink
                    document={<MyDocument formData={formData} />}
                    fileName={`${formData?.personalDetails?.name || "resume"}.pdf`}
                    className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md shadow-sm text-white bg-[#2A5D9E] hover:bg-[#234e86] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A5D9E] transition-colors cursor-pointer w-full sm:w-auto"
                  >
                    {({ loading }) => (
                      <>
                        <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        {loading ? "Preparing..." : "Download"}
                      </>
                    )}
                  </PDFDownloadLink>
                )}

                <button
                  onClick={SaveResume}
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md shadow-sm text-white bg-[#2A5D9E] hover:bg-[#234e86] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A5D9E] transition-colors cursor-pointer w-full sm:w-auto disabled:bg-gray-500"
                  disabled={saved}
                >
                  {isSaving ? 
                    <LoaderCircle className='animate-spin' /> 
                    : saved 
                    ? <>
                        <CheckCheck size={18} className="mr-2"/>
                        Saved
                      </> 
                    : <>
                        <Save size={16} className="mr-2"/>
                        Save Resume
                      </>
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateNewResume;
