import {useState} from 'react'
import PasswordVisibility from '../../utils/PasswordVisibility'
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import {resetPasswordSchema} from "../../utils/schemas/resetPasswordSchema"
import axios from '../../api/axios';
import { useParams } from 'react-router';
import PasswordResetMsg from '../../utils/messages/PasswordResetMsg';
import FailedMsg from '../../utils/messages/FailedMsg';
import { LoaderCircle } from 'lucide-react';
const ResetPassword = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const { passwordToggleButton, showPassword } = PasswordVisibility();
    const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
        resolver: yupResolver(resetPasswordSchema)
    });
    const { token } = useParams();
    const resetpasswordUrl = `/auth/reset-password/${token}`
    const resetPasswordForm = async (data)=>{
        setLoading(true);
        const formData = new FormData();
        formData.append("password", data.password)
        try{
            const response = await axios.post(
                resetpasswordUrl,
                formData,
                {headers: {"Content-Type": "application/json"}}
            )
            if(response?.status === 200){
                setSuccess(true);
                reset();
            }
        }catch(err){
            setErrMsg("");
            setTimeout(()=>{
                if(!err?.response){
                    setErrMsg("Something went wrong");
                }else if(err.response?.status === 404){
                    setErrMsg("Password or token is required");
                }else if(err.response?.status === 400){
                    setErrMsg("Token is invalid or expired");
                }else{
                    setErrMsg("Unable to reset password");
                }
            }, 50)
        }finally{
            setLoading(false);
        }
    }


  return (
    <main className='flex flex-col items-center justify-center relative top-36 font-montserrat'>
        <h1 className='font-semibold text-2xl'>Reset Password</h1>
        <p className='text-sm text-[#7a7a7a] text-center'>
            Your new password must be different from previous used passwords
        </p>
        {success ? (
            <PasswordResetMsg setSuccess={setSuccess} />
        ) : errMsg && <FailedMsg errMsg={errMsg} setErrMsg={setErrMsg}/>}
        <form onSubmit={handleSubmit(resetPasswordForm)} className='flex flex-col gap-2 px-5 mt-1 mb-10'>
            <div className="flex flex-col">
                <label htmlFor="password">password</label>
                <div className="relative">
                    <input 
                        id='password'
                        type={showPassword ? "text" : "password"} 
                        className='input-field placeholder:text-sm'
                        placeholder='123@at'
                        {...register("password")}
                    />
                    <p className='text-[12px] text-red-700 text-left font-medium'>{errors.password?.message}</p>
                </div>
                <p className='text-[12px] text-[#7a7a7a] font-medium'>Must be at least 8 characters</p>
            </div>
            <div className="flex flex-col">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                    <input 
                        id='confirmPassword'
                        type={showPassword ? "text" : "password"}
                        className='input-field placeholder:text-sm'
                        placeholder='123@'
                        {...register("confirmPassword")}
                    />
                    {watch("confirmPassword") && passwordToggleButton}
                </div>
                <p className='text-[12px] text-[#7a7a7a] font-medium'>Both passwords must match</p>
                <p className='text-[12px] text-red-700 text-left font-medium'>{errors.confirmPassword?.message}</p>
            </div>
            <button type='submit' className='submit-btn'>
                {loading ? 
                    <div className='flex items-center justify-center gap-2'>
                        <LoaderCircle className='animate-spin' />
                    </div>: 
                    "Reset Password"
                }
            </button>
        </form>
    </main>
  )
}

export default ResetPassword;