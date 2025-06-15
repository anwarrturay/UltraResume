import { useState } from 'react'
import { useNavigate } from 'react-router';
import WokPepaLogoPng from "../../assets/WokPepaLogoPng.png";
import axios from "../../api/axios";
import VerificationLinkMsg from "../../utils/messages/VerificationLinkMsg"
import FailedMsg from "../../utils/messages/FailedMsg"
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { schema } from '../../utils/schemas/FieldValidations';
import PasswordVisibility from '../../utils/PasswordVisibility';
import { FcGoogle } from "react-icons/fc";
import { BASE_URL } from '../../api/axios';
import { LoaderCircle } from 'lucide-react';

const Register = () => {
    const register_url = "/register";
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const navigate = useNavigate();
    const { passwordToggleButton, showPassword } = PasswordVisibility();

    const { register, handleSubmit, formState: {errors}, watch, reset } = useForm({
        resolver: yupResolver(schema)
    })

    const handleGoogleSignup = () => {
        window.open(`${BASE_URL}/auth/google`,  "_self");
    };
        

    const handleSubmitForm = async (data)=>{
        setIsLoading(true);

        const formData = new FormData();
        formData.append("firstname", data.firstname);
        formData.append("lastname", data.lastname);
        formData.append("email", data.email);
        formData.append("telephone", data.telephone);
        formData.append("password", data.password);
        formData.append("profession", data.profession);

        if (data.image && data.image[0]) {
            formData.append("image", data.image[0]);
        }

        try{
            const response = await axios.post(
                register_url, 
                formData,
                {
                    headers: {"Content-Type": "multipart/form-data"}
                }
            )
            if(response.status === 201){
                setSuccess(true);
                reset();
                setErrMsg("");
            }
        }catch(err){
            setIsLoading(false);
            setErrMsg("");

            setTimeout(()=>{
                if(!err?.response){
                    setErrMsg("No Server response");
                }else if(err.response?.status === 409){
                    setErrMsg("A user with this name already exist");
                }else{
                    setErrMsg("Registration Failed");
                }
            }, 50)
        }finally{
            setIsLoading(false);
        }
    }

    const marginBottom = "mb-2"

  return (
    <div className="flex items-center justify-center flex-col scroll-smooth">
        <div className='flex flex-col relative top-10 font-montserrat mb-24'>
            <div className="flex flex-col items-center justify-center">
                <img src={WokPepaLogoPng} alt="WokPepaLogo" className='w-[50px]'/>
            </div>
            <div className="font-bold text-xl text-center mt-3 text-[#333333]">Create a WokPepa Account</div>
            <p className='font-Montserrat ml-2 mt-2 mb-3 text-base text-center'>
                Already have an account?{' '}
                <span onClick={()=> navigate(-1)} className="text-[#2A5D9E] cursor-pointer font-semibold hover:underline">
                    Sign In
                </span>
            </p>
            {success ? 
					(<VerificationLinkMsg />) : 
					(errMsg && <FailedMsg errMsg={errMsg} setErrMsg={setErrMsg} />)
			}
            <div className="flex flex-col items-center justify-center">
                {/* Google OAuth Button */}
                <button
                    onClick={handleGoogleSignup}
                    className="flex items-center justify-center w-[280px] xs:w-[312px] sm:w-[385px] px-2 py-2.5 border border-[#ccc] rounded-md hover:bg-gray-100 transition cursor-pointer"
                >
                    <FcGoogle className="text-xl mr-2" />
                    <span className="text-sm font-medium">Sign up with Google</span>
                </button>
                {/* Divider */}
                <div className="flex items-center my-3">
                    <div className="flex-grow h-px bg-gray-300"></div>
                    <span className="px-4 text-sm text-gray-500">or continue with</span>
                    <div className="flex-grow h-px bg-gray-300"></div>
                </div>
            </div>
            <form onSubmit={handleSubmit(handleSubmitForm)} className='flex flex-col items-center mx-4 mt-5'>
                <div className="flex flex-col">
                    <input 
                        type="text"
                        {...register("firstname")}
                        autoComplete="off"
                        placeholder="Firstname"
                        className="input-field"
                    />
                    {errors.firstname &&
                        <div className={`flex items-center`}>
                            <p className='text-start error-msg'>{errors.firstname?.message}</p>
                        </div>
                    }
                </div>
                <div className="flex flex-col">
                    <input 
                        type="text"
                        {...register("lastname")}
                        autoComplete="off"
                        placeholder="Lastname"
                        className="input-field"
                    />
                    {errors.lastname &&
                        <div className={`flex items-center ${marginBottom}`}>
                            <p className='error-msg'>{errors.lastname?.message}</p>
                        </div>
                    }
                </div>
                <div className="flex flex-col">
                    <input 
                        type="email"
                        {...register("email")}
                        autoComplete="off"
                        placeholder="Email"
                        className="input-field"
                    />
                    {errors.email && 
                        <div className={`flex items-center ${marginBottom}`}>
                            <p className='error-msg'>{errors.email?.message}</p>
                        </div>
                    }
                </div>
                
                <div className="flex flex-col">
                    <input 
                        type="number"
                        {...register("telephone")}
                        autoComplete="off"
                        placeholder="Phone"
                        className="input-field"
                    />
                    {errors.telephone &&
                        
                        <div className={`flex items-start ${marginBottom}`}>
                            <p className='error-msg w-[240px]'>{errors.telephone?.message}</p>
                        </div>
                    }
                </div>
                
                <div className="flex flex-col">
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            autoComplete="off"
                            placeholder="Password"
                            className="input-field"
                        />
                        {watch("password") && passwordToggleButton}
                    </div>
                    <div className='text-[12px] text-gray-700 font-medium mb-2'>Passwords must be atleast 8 characters</div>
                    {errors.password &&

                        <div className={`flex items-center ${marginBottom}`}>
                            <p className='error-msg'>{errors.password?.message}</p>
                        </div>
                    }
                </div>
                <div className="flex flex-col">
                    <input 
                        type="text"
                        {...register("profession")}
                        autoComplete="off"
                        placeholder="Profession"
                        className="input-field"
                    />
                    {errors.profession && 
                        <div className={`flex items-center ${marginBottom}`}>
                            <p className='error-msg'>{errors.profession?.message}</p>
                        </div>
                    }
                </div>
                <div className="flex flex-col">
                    <input 
                        type="file"
                        accept='image/*'
                        {...register("image")}
                        className="input-field"
                    />
                    { errors.image &&
                        <div className={`flex items-start ${marginBottom}`}>
                            <p className='error-msg w-[200px]'>{errors.image?.message}</p>
                        </div>
                    }
                </div>
                <button 
                    type="submit" 
                    className="submit-btn"
                >
                    {isLoading ? 
                        <div className='flex items-center justify-center gap-2'>                            
                            <LoaderCircle className='animate-spin' /> 
                        </div>
                        :
                    "Create Account"}
                </button>
            </form>
        </div>
    </div>
  )
}

export default Register;