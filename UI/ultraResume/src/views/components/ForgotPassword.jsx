import {useState, useEffect} from 'react'
import { MoveLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import emailSchema from '../../utils/schemas/forgotPasswordSchema';
import { LoaderCircle } from 'lucide-react';
import axios from '../../api/axios';
import ForgotPasswordMsg from '../../utils/messages/ForgotPasswordMsg';
import FailedMsg from '../../utils/messages/FailedMsg';
const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();
  const { register, handleSubmit, formState: {errors}, reset} = useForm({
    resolver: yupResolver(emailSchema)
  })
  const requestUrl = "/forgot-password"; 
  const RenderEmail = async (data)=>{
    setLoading(true);
    const formData = new FormData();
    formData.append("email", data.email)
    try{
      const response = await axios.post(
        requestUrl, 
        formData,
        {headers: {"Content-Type": "application/json"}}
      );
      if(response.status === 200){
        setSuccess(true);
        reset();
      }
    }catch(err){
      setErrMsg("");

      setTimeout(()=>{
        if(!err?.response){
          setErrMsg("Something went wrong.");
        }else if(err.response?.status === 404){
            setErrMsg("Email does not exists");
        }
      }, 50)
    }finally{
      setLoading(false)
    }
  }


  return (
    <main className='flex flex-col items-center justify-center relative top-36 font-montserrat'>
      <h1 className='font-semibold text-2xl'>Forgot Password?</h1>
      <p className='text-sm text-[#7a7a7a]'>No worries we'll send you reset instructions </p>
      {success ? (
        <ForgotPasswordMsg setSuccess={setSuccess} />
      ): errMsg && <FailedMsg errMsg={errMsg} setErrMsg={setErrMsg}/>}
      <form onSubmit={handleSubmit(RenderEmail)} className='flex flex-col gap-2 px-5 mt-3'>
        <div className="flex flex-col relative">
          <input 
            type="email" 
            className='input-field placeholder:text-sm'
            placeholder='example@gmail.com'
            {...register("email")}
          />
          <p className='text-[12px] text-red-700 text-left font-medium'>{errors.email?.message}</p>
        </div>
        <button type='submit' className='submit-btn'>
          {loading ? 
            <div className='flex items-center justify-center gap-2'>
              <LoaderCircle className='animate-spin'/>
            </div> : "Reset Password"
          }
          </button>
        <button onClick={(e)=> {
              e.preventDefault();
              navigate("/")
          }} className='flex justify-center py-2.5 rounded-md font-medium cursor-pointer'>
          <MoveLeft className='mr-3'/>
          Back to Login
        </button>
      </form>
      <div className="flex items-center justify-center mt-4">
        Want an account?
        <span
            className="text-[#2A5D9E] cursor-pointer font-medium ml-1 hover:underline"
            onClick={() => navigate('/register')}
        >
          Create one
        </span>
      </div>
    </main>
  )
}

export default ForgotPassword