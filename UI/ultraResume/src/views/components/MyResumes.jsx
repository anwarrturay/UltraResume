import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Download, Trash2, Edit2, Search, Plus, LoaderCircle } from 'lucide-react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAuth from '../../hooks/useAuth';
import { PDFDownloadLink } from '@react-pdf/renderer';
import MyDocument from './new-resume/resumepdf/MyDocument';
const MyResumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState({status:false, id:null});
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const userId = auth?.userId;

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await axiosPrivate.get(`/resumes/user-pdfs/${userId}`);
        setResumes(response.data);
      } catch (err) {
        console.error("Error fetching resumes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, [userId, axiosPrivate]);

  const handleDelete = async (resumeId) => {
    setIsDeleting({status:true, id:resumeId})
    try {
      await axiosPrivate.delete(`/resumes/${resumeId}`);
      setResumes(resumes.filter(resume => resume._id !== resumeId));
    } catch (err) {
      console.error("Error deleting resume:", err);
    }finally{
      setIsDeleting({status:false, id:null});
    }
  };

  const editResume = async (resumeId) => {
    try {
      if(resumeId) navigate(`/my-resumes/edit/${resumeId}`)
    } catch (err) {
      console.error("Error fetching resume for edit:", err);
    }
  };

  const filteredResumes = resumes.filter(resume => {
    const searchString = searchTerm.toLowerCase();
    const title = resume.personalDetails?.title?.toLowerCase() || '';
    return title.includes(searchString);
  });

  return (
    <section className='font-montserrat min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
        {/* Header Section */}
        <div className='mb-6 sm:mb-8'>
          <div onClick={() => navigate("/user-resume-dashboard")} 
               className="inline-flex items-center text-gray-600 hover:text-[#2A5D9E] cursor-pointer mb-4">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <span className="text-sm sm:text-base">Back to Dashboard</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>My Resumes</h1>
            <button
              onClick={() => navigate('/create-new-resume')}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#2A5D9E] hover:bg-[#2a5c9ed0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A5D9E] w-full sm:w-auto"
            >
              <Plus size={20} className='mr-2'/>
              Create New Resume
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-6 sm:mb-8">
          <div className="w-full sm:max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search resumes by title"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 text-sm sm:text-base text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A5D9E] focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2A5D9E]"></div>
            <p className='mt-2'>Fetching resumes...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-lg shadow-sm px-4">
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No resumes yet</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6">Create your first resume to get started!</p>
            <button
              onClick={() => navigate('/create-new-resume')}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#2A5D9E] hover:bg-[#2a5c9ed0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A5D9E] w-full sm:w-auto"
            >
              <Plus size={20} className='mr-2'/>
              Create Resume
            </button>
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-lg shadow-sm">
            <p className="text-sm sm:text-base text-gray-500">No resumes match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredResumes.map((resume) => (
              <div
                key={resume._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full"
              >
                <div className="p-4 sm:p-6">
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                      {resume.personalDetails?.title || 'Untitled Resume'}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {resume?.updatedAt || 'No last date updated provided'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-2 sm:space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => editResume(resume._id)}
                        className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-[#2A5D9E] bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A5D9E]"
                      >
                        <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        Edit
                      </button>
                      <PDFDownloadLink
                        document={<MyDocument formData={resume} />}
                        fileName={`${resume?.personalDetails?.title || 'resume'}.pdf`}
                        className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        {({ loading }) => (
                          <>
                            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                            {loading ? "Loading..." : "Download"}
                          </>
                        )}
                      </PDFDownloadLink>
                    </div>
                    <button
                      onClick={() => handleDelete(resume._id)}
                      className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
                    >
                      {isDeleting.status === true && isDeleting.id === resume?._id ? (
                        <div className="flex items-center text-red-500">
                          <LoaderCircle className='h-3 w-3 sm:h-4 mr-1.5 sm:mr-2 animate-spin'/>
                          <p>Deleting...</p>
                        </div>
                      ): (
                        <div className='flex items-center'>
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                          Delete
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyResumes;
