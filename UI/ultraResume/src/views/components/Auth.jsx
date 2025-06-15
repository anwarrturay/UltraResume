import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, useParams } from 'react-router';
import WokPepaLogoPng from "../../assets/WokPepaLogoPng.png";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '../../utils/LoginValidation';
import axios from '../../api/axios';
import VerificationLinkMsg from "../../utils/messages/VerificationLinkMsg"
import FailedMsg from "../../utils/messages/FailedMsg"
import useAuth from "../../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import PasswordVisibility from '../../utils/PasswordVisibility';
import { LoaderCircle } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";
import { BASE_URL } from '../../api/axios';

const Auth = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [errMsg, setErrMsg] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { setAuth, persist, setPersist } = useAuth();
    const { passwordToggleButton, showPassword } = PasswordVisibility();
    const { token } = useParams();
    const auth_url = token ? `/auth/${token}` : "/auth";
    // Determine where to redirect after login; default to dashboard.

    const { register, handleSubmit, formState: { errors }, watch } = useForm({
        resolver: yupResolver(loginSchema)
    });

    const handleGoogleLogin = () => {
        window.open(`${BASE_URL}/auth/google`, "_self")
    };

    const handleSubmitForm = async (data) => {
        setIsLoading(true);

        try {
        const response = await axios.post(
            auth_url,
            {
                email: data.email,
                password: data.password
            },
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true
            }
        );

        const accessToken = response.data?.accessToken;
        const decodedToken = jwtDecode(accessToken);
        const userId = decodedToken.UserInfo.id;
        const isNewUser = decodedToken?.isNewUser;
        const from = isNewUser ? "/tips" : location.state?.from?.pathname || "/user-resume-dashboard";
        
        setAuth({ accessToken, email: data.email, userId });
        
        if (response.status === 200) {
            setErrMsg("");
            setTimeout(() => {
                navigate(from, { replace: true });
            }, 5000);
        }
        } catch (err) {
            setIsLoading(false);
            setErrMsg('');

            setTimeout(()=>{
                if (!err?.response) {
                    setErrMsg("Something went wrong");
                } else if (err.response?.status === 401) {
                    setErrMsg("Incorrect email or password");
                }else if(err.response?.status === 403){
                    setErrMsg("Please verify your email");
                }else if(err.response?.status === 404){
                    setErrMsg("No user with email or password ")
                }
                else {
                    setErrMsg("Login failed, Please try again");
                }
            }, 50);
        }
    };

    const togglePersist = ()=>{
        setPersist(prev=> !prev)
    }

    useEffect(()=>{
        localStorage.setItem("persist", persist)
    }, [persist])


    return (
        <div className="flex flex-col items-center justify-center scroll-smooth relative top-12">
            <img src={WokPepaLogoPng} alt="WokPepaLogo" className="relative w-[50px] top-12" />
            <div className='flex flex-col relative top-12 font-montserrat'>
                <div className="flex flex-col items-center justify-center">
                    <h2 className="font-bold font-Montserrat m-2 text-lg text-[#333333] text-center">
                        Sign In with a WokPepa Account
                    </h2>
                    {success ? 
                            (<VerificationLinkMsg />) : 
                            (errMsg && <FailedMsg errMsg={errMsg} setErrMsg={setErrMsg} />)
                    }
                    {/* OAuth2.0 Button */}
                    <div className="space-y-3 mt-3">
                        <button
                            onClick={handleGoogleLogin}
                            className="flex items-center justify-center w-[280px] xs:w-[312px] sm:w-[385px] px-2 py-2.5 border border-[#ccc] rounded-md hover:bg-gray-100 transition cursor-pointer"
                        >
                            <FcGoogle className="text-xl mr-2" />
                            <span className="text-sm font-medium">Continue with Google</span>
                        </button>
                    </div>
                    {/* Divider */}
                    <div className="flex items-center my-3">
                        <div className="flex-grow h-px bg-gray-300"></div>
                        <span className="px-4 text-sm text-gray-500">or continue with</span>
                        <div className="flex-grow h-px bg-gray-300"></div>
                    </div>

                </div>
                <form onSubmit={handleSubmit(handleSubmitForm)} className="flex flex-col items-center mx-4 mt-5">
                    <div className="flex flex-col">
                        <div className="relative flex flex-col">
                            <input
                                type="email"
                                {...register("email")}
                                // autoComplete='off'
                                placeholder="Email"
                                className="input-field"
                            />
                        </div>
                        {errors.email && (
                            <div className="flex items-center mb-3">
                                <p className="flex-start error-msg ml-2 mt-3">{errors.email?.message}</p>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("password")}
                                // autoComplete='off'
                                placeholder="Password"
                                className="input-field"
                            />
                            {watch("password") && passwordToggleButton}
                        </div>
                        {errors.password && (
                            <div className="flex items-start">
                                <p className="flex-start error-msg ml-2 mt-2 w-[230px] xs:w-[260px] sm:w-[300px]">
                                {errors.password?.message}
                                </p>
                            </div>
                        )}
                    </div>
                    <button type="submit" className="submit-btn">
                        {isLoading ? 
                            <div className='flex items-center justify-center gap-2'>                            
                                <LoaderCircle className='animate-spin' /> 
                            </div>
                            :
                            "Sign In"
                        }
                    </button>

                    <div className="flex flex-col justify-start mt-2">
                        <div className="flex">
                            <input 
                                type="checkbox" 
                                id='persist'
                                onChange={togglePersist}
                                checked={persist}
                                className='mr-2'
                            />
                            <label htmlFor="persist">Keep me signed in</label>
                        </div>
                    </div>
                </form>
                <div className="flex flex-col font-Montserrat mb-3 ml-3 mt-3 text-base text-center">
                    <Link to={'/forgot-password'} className='text-[#2A5D9E] font-semibold hover:underline'>
                            Forgot Password?
                    </Link>
                    <div className="flex items-center justify-center">
                        Want an account?{' '}
                        <span
                            className="text-[#2A5D9E] cursor-pointer font-semibold ml-1 hover:underline"
                            onClick={() => navigate('/register')}
                        >
                            Create one
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
