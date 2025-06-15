import { useState} from 'react'
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import { passwordSchema } from '../../../utils/schemas/ChangePasswordSchema';
import useAxiosPrivate from "../../../hooks/useAxiosPrivate"
import useAuth from '../../../hooks/useAuth';
import FailedMsg from '../../../utils/messages/FailedMsg';
import UpdatedMsg from '../../../utils/messages/UpdatedMsg';
import PasswordVisibility from '../../../utils/PasswordVisibility';
const Password = () => {
    const [success, setSuccess] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const axiosPrivate = useAxiosPrivate();
    const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
        resolver: yupResolver(passwordSchema),
    });
    const { passwordToggleButton, showPassword } = PasswordVisibility();
    const { auth } = useAuth();
    const userId = auth?.userId;

    const handleChangePassword = async (data)=>{
        const formData = new FormData();
        formData.append("password", data.password)
        try{
            const response = await axiosPrivate.patch(
                `/users/profile/${userId}`,
                formData
            )
            if(response.status === 200){
                alert("Password has been changed");
                setSuccess(true);
                setErrMsg("")
                setValue("password", response.data.password)
                reset();
            }
        }catch(err){
            console.error(err);
            setErrMsg(err.response?.data?.message || "Unable to change Password")
        }
    }

    const inputId1 = "floating_outlined_1"
    const inputId2 = "floating_outlined_2"

  return (
    <>
        <p>Password</p>
        <form onSubmit={handleSubmit(handleChangePassword)} className='mt-4'>
            {success ? 
                    (<UpdatedMsg />) : 
                    (errMsg && <FailedMsg errMsg={errMsg} setErrMsg={setErrMsg} />)
            }
            <div className="relative mt-3">
                <input 
                    type={showPassword ? "text" :"password"} 
                    id={inputId1}
                    {...register("password")}
                    className={`block px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:border-[#ccc] dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer w-[280px] xs:w-[312px] sm:w-[385px] ${errors.password ? 'border-red-500' : ''}`} 
                    placeholder=" " />
                <label 
                    htmlFor="floating_outlined_1" 
                    className="absolute text-xs text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#f5f5f5] px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">New Password</label>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password?.message}</p>}
            </div>
            <div className="relative mt-3">
                <input 
                    type={showPassword ? "text": "password"} 
                    id={inputId2}
                    {...register("confirmPassword", {
                        validate: (value) => value === watch("password") || "Passwords do not match"
                    })}
                    className={`block px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:border-[#ccc] dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer w-[280px] xs:w-[312px] sm:w-[385px] ${errors.password ? 'border-red-500' : ''}`} 
                    placeholder=" " />
                    {passwordToggleButton}
                <label 
                    htmlFor="floating_outlined_2" 
                    className="absolute text-xs text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#f5f5f5] px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Confirm Password</label>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword?.message}</p>}
            </div>
            <button type="submit" className='submit-btn'>change password</button>
        </form>
    </>
  )
}

export default Password