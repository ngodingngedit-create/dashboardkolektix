import React, { useEffect, useState } from "react";
import Logo from "@images/kolektix logo tansparant-blue.png";
import LogoWhite from "@images/newkolektix.gif";
import OTPInput from "react-otp-input";
import { faMessage } from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import useLoggedUser from "@/utils/useLoggedUser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { Spinner } from "@nextui-org/react";
import { Get, Post } from "@/utils/REST";
import { toast } from "react-toastify";
import Countdown, { CountdownRendererFn } from "react-countdown";
import { PasswordInput, TextInput } from "@mantine/core";
import { useSetState } from "@mantine/hooks";
import { UserProps } from "@/utils/globalInterface";

interface RegisterForm {
  name: string;
  name_event_organizer: string;
  location: string;
  phone_number: string;
  image: string;
  email: string;
  password: string;
  password_confirm: string;
  otp_code: string;
}

interface ErrorRegisterProps {
  [key: string]: string[];
}

const Form = ({ placeholder, label, onChange, value, type }: { placeholder: string; label?: string; onChange?: (e: any) => void; value?: string; type?: string }) => {
  return (
    <div>
      <label htmlFor="email" className="block mb-2 ml-1 text-[12px] font-medium text-dark">
        {label}
        <input type={type ? type : "text"} name="" id="" placeholder={placeholder} value={value} className="bg-[#e2edfc] py-2 px-3 text-xs w-full text-dark rounded-full" onChange={onChange} />{" "}
      </label>
    </div>
  );
};

const Auth = () => {
  const router = useRouter();
  const [step, setStep] = useState<number>(0);
  const [otp, setOtp] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [data, setData] = useSetState<RegisterForm>({
    name: "",
    name_event_organizer: "",
    location: "",
    phone_number: "",
    image: "",
    email: "",
    password: "",
    password_confirm: "",
    otp_code: "",
  });
  const [imageOpacity, setImageOpacity] = useState<number>(0);
  const [errors, setErrors] = useSetState<Partial<RegisterForm & { message: string; error: string }>>({});
  const [errorRegister, setErrorRegister] = useState<ErrorRegisterProps>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [countdownEndTime, setCountdownEndTime] = useState<Date | null>(null);
  const [countdownActive, setCountdownActive] = useState<boolean>(false);
  const users = useLoggedUser();

  const ticketCount = Cookies.get("ticketCount");
  const prevPath = Cookies.get("prevPath");

  useEffect(() => {
    if (users?.id) {
      if (users.role === 'Admin') {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard");
      }
      toast.warning("Anda Sudah Login");
    }
    //eslint-disable-next-line
  }, [users]);

  const Completionist = () => (
    <button className="text-dark w-full rounded-full p-2 text-xs font-semibold flex items-center gap-2 hover:text-primary-base" onClick={handleResendOtp}>
      Kirim Ulang
    </button>
  );

  const renderer: CountdownRendererFn = ({ minutes, seconds, completed }) => {
    if (completed) {
      setCountdownActive(false);
    } else {
      return (
        <span className="text-dark w-full text-center">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      );
    }
  };

  const handleResendOtp = () => {
    setCountdownEndTime(new Date(Date.now() + 120000));
    setCountdownActive(true);
    // If step is 4, it's creator registration OTP, otherwise it's login OTP
    if (step === 4) {
      // Resend OTP for creator registration
      Post("register", { email: data.email, name: data.name_event_organizer })
        .then((res: any) => {
          console.log(res);
        })
        .catch((err: any) => {
          console.log(err);
        });
    } else {
      login();
    }
  };

  useEffect(() => {
    setErrors({
      name: undefined,
      email: undefined,
      password: undefined,
      password_confirm: undefined,
      otp_code: undefined,
      message: undefined,
      error: undefined,
    });
  }, [data, step]);

  const submitRegister = (event?: React.FormEvent) => {
    event?.preventDefault();

    if (data.email == "") setErrors({ email: "Wajib Diisi" });
    if (Object.values(errors).filter((e) => !!e).length > 0) return;

    setLoading(true);
    Post("register", { email: data.email, name: data.name_event_organizer })
      .then((res: any) => {
        setLoading(false);
        setCountdownEndTime(new Date(Date.now() + 120000));
        setCountdownActive(true);
        setStep(4); // Move to OTP step
        console.log(res);
      })
      .catch((err: any) => {
        setLoading(false);
        console.log(err);
        setErrors(err.response.data);
      });
  };

  // const getPermission = async () => {
  //   const res = (await Get("permissions", {})) as any;
  //   await Cookies.set("permissions", JSON.stringify(res.data));
  // };

  const login = async (event?: React.FormEvent) => {
    event?.preventDefault();

    if (data.email == "") setErrors({ email: "Wajib Diisi" });
    if (data.password == "") setErrors({ password: "Wajib Diisi" });
    if (Object.values(errors).filter((e) => !!e).length > 0) return;

    setLoading(true);
    Post("login-auth", data)
      .then(async (res: any) => {
        // await getPermission();
        setLoading(false);
        // setCountdownEndTime(new Date(Date.now() + 120000));
        // setCountdownActive(true);
        // setStep(2);

        Cookies.set("token", res.access_token);
        const role: UserProps["role"] = res?.user_access?.some((e: any) => e?.has_role.id == 3) ? "Creator" : res?.user_access?.some((e: any) => e?.has_role?.name == "Admin") ? "Admin" : "Staff";

        // Optimize cookie size by only storing essential info
        const userData = {
          id: res?.data?.id,
          name: res?.data?.name,
          email: res?.data?.email,
          role,
          force_creator: true,
          has_creator: res?.data?.has_creator ? {
            id: res.data.has_creator.id,
            name: res.data.has_creator.name,
            name_event_organizer: res.data.has_creator.name_event_organizer,
            slug: res.data.has_creator.slug,
            is_verified: res.data.has_creator.is_verified,
            verified_status_id: res.data.has_creator.verified_status_id,
          } : undefined,
          permissions: (res?.data?.permissions ?? []).map((p: any) => ({
            module_id: p.module_id
          }))
        };

        Cookies.set("user_data", JSON.stringify(userData));
        setLoading(false);
        router.push(role == "Admin" ? "/dashboard/admin" : "/dashboard");
      })
      .catch((err: any) => {
        if (err.response.status === 401) {
          toast.error("Email belum terdaftar. Silahkan registrasi terlebih dahulu");
          setStep(1);
        }
        setErrors(err.response.data);
        setLoading(false);
      });
  };

  const verifyRegister = () => {
    setLoading(true);
    Post("verify-register", { email: data.email, name: data.name_event_organizer, otp_code: data.otp_code })
      .then((res: any) => {
        console.log(res);
        Cookies.set("token", res.access_token);
        setLoading(false);
        setStep(5); // Move to password setup step
      })
      .catch((err: any) => {
        setOtp("");
        console.log(err.response.data.message);
        setErrors(err.response.data);
        setLoading(false);
      });
  };

  const verifyLogin = () => {
    setLoading(true);
    Post("verify-login", data)
      .then((res: any) => {
        console.log(res);
        Cookies.set("token", res.access_token);
        Cookies.set("user_data", JSON.stringify({ ...res.data, force_creator: true, role: "Staff" }));
        Cookies.set("bookmarked", JSON.stringify(res.bookmarked));
        setLoading(false);
        router.push("/dashboard");
      })
      .catch((err: any) => {
        setOtp("");
        console.log(err.response.data.error);
        setErrors(err.response.data);
        setLoading(false);
      });
  };

  const handleFile = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_SIZE = 2 * 1024 * 1024; // 2MB
      if (file.size > MAX_SIZE) {
        toast.error("Maksimal ukuran gambar adalah 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setData({ image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const submitCreator = () => {
    if (data.password == "") setErrors({ password: "Wajib Diisi" });
    if (data.password.length < 8) setErrors({ password: "Minimal 8 Karakter" });
    if (data.password != data.password_confirm) setErrors({ password_confirm: "Password Tidak Sama" });
    if (Object.values(errors).filter((e) => !!e).length > 0) return;

    setLoading(true);
    const creatorData = {
      image: data.image,
      name_event_organizer: data.name_event_organizer,
      name: data.name,
      location: data.location,
      phone_number: data.phone_number,
      email: data.email,
      password: data.password,
      password_confirmation: data.password_confirm,
      user_id: null,
      status: "active",
      category_id: 1,
      latitude: "1",
      longitude: "2",
      website: "www.example.net",
    };

    Post("creator", creatorData)
      .then((res: any) => {
        console.log(res);
        Cookies.set("user_data", JSON.stringify({ ...res.data, force_creator: true, role: "Creator", has_creator: res.data }));
        setLoading(false);
        toast.success("Akun creator berhasil dibuat");
        router.push("/dashboard");
      })
      .catch((err: any) => {
        console.log(err);
        setErrors(err.response.data);
        toast.error(err.response.data.message || "Terjadi kesalahan");
        setLoading(false);
      });
  };


  useEffect(() => {
    setImageOpacity(1);
  }, []);

  const [displayedText, setDisplayedText] = useState<string>("");

  useEffect(() => {
    setImageOpacity(1);
  }, []);

  useEffect(() => {
    const text = "Masa Depan Tongkrongan";
    let index = 0;

    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text[index - 1]);
      index += 1;
      if (index === text.length) {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setData({ ...data, otp_code: otp });
    //eslint-disable-next-line
  }, [otp]);

  return (
    <div className="flex min-h-screen justify-center items-center bg-primary-base px-5 !py-4 md:px-20">
      <div className="lg:w-1/2 xs:hidden md:flex flex-col justify-center items-center gap-8">
        <Image
          src={LogoWhite}
          alt="logo"
          style={{
            opacity: imageOpacity,
            transition: "opacity 1.5s ease-in-out",
          }}
        />
        {/* <h3 className={`text-white`}>{displayedText}</h3> */}
      </div>
      <div className="sm:w-full lg:max-w-[450px] flex flex-col justify-center items-center lg:px-10 max-w-xl">
        <div className="bg-white rounded-2xl flex flex-col justify-center w-full pt-6 pb-2 px-6">
          {step === 0 && (
            <div className={`flex flex-col justify-center items-center transition-opacity duration-100 ${step === 0 ? "opacity-100" : "opacity-0"}`}>
              <Image src={Logo} alt="Logo" className="w-1/2" />
              <h2 className="text-dark font-semibold text-xl mt-4 text-center">Masuk ke Akun Creator</h2>
              <div className="flex">
                <p className="text-grey text-[14px] mt-1 mb-2 text-center">
                  Belum punya akun?
                  <span
                    className="cursor-pointer text-primary-base font-semibold"
                    onClick={() => {
                      setStep(1);
                    }}
                  >
                    {" "}
                    Daftar Creator
                  </span>
                </p>
              </div>
              <div className="flex flex-col w-full mt-2">
                <form onSubmit={login}>
                  <TextInput labelProps={{ size: "xs" }} label="Email" placeholder="Masukan Email" mb={10} value={data.email} onChange={(e) => setData({ email: e.target.value })} error={errors.email} />
                  <PasswordInput labelProps={{ size: "xs" }} label="Password" placeholder="Masukan Password" value={data.password} onChange={(e) => setData({ password: e.target.value })} error={errors.password} />
                  {/* <Form
                    placeholder='Alamat Email'
                    onChange={(e: any) => setData({ ...data, email: e.target.value })}
                  /> */}
                  {errors && <p className="text-danger text-[10px] mt-1">{errors.message}</p>}
                  <button className="bg-primary-base text-white w-full rounded-full p-2 text-xs my-4 flex items-center justify-center disabled:bg-primary-disabled" type="submit" onClick={login} disabled={loading}>
                    {loading ? <Spinner color="default" size="sm" /> : "Selanjutnya"}
                  </button>
                </form>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className={`transition-opacity duration-300 opacity-0 ${step === 1 && "opacity-100"}`}>
              <div className="flex justify-center flex-col items-center">
                <Image src={Logo} alt="Logo" className="w-1/3 mb-[20px]" />
                <h2 className="text-dark font-semibold text-xl mt-2">Daftar Akun Creator</h2>
                <p className="text-grey text-sm text-center mb-3">Step 1 dari 3: Detail Penyelenggara</p>
                <div className="flex">
                  <p className="text-grey text-sm text-center mb-3">
                    Sudah punya akun?
                    <span
                      className="cursor-pointer text-primary-base font-semibold"
                      onClick={() => {
                        setStep(0);
                      }}
                    >
                      {" "}
                      Masuk
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col w-full px-5 gap-3">
                <div>
                  <TextInput 
                    labelProps={{ size: "xs" }} 
                    label="Nama Penyelenggara Event" 
                    placeholder="Misal: javamusikindo" 
                    mb={10} 
                    value={data.name_event_organizer} 
                    onChange={(e) => setData({ name_event_organizer: e.target.value })} 
                    error={errors.name_event_organizer} 
                  />
                </div>
                <div>
                  <TextInput 
                    labelProps={{ size: "xs" }} 
                    label="Nama Pemilik" 
                    placeholder="Masukan Nama Pemilik" 
                    mb={10} 
                    value={data.name} 
                    onChange={(e) => setData({ name: e.target.value })} 
                    error={errors.name} 
                  />
                </div>

                <button 
                  className="bg-primary-base mt-[20px] mb-[20px] text-white w-full rounded-full p-2 text-xs disabled:bg-primary-disabled disabled:opacity-50" 
                  onClick={() => setStep(2)}
                  disabled={!data.name_event_organizer || !data.name}
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className={`transition-opacity duration-300 opacity-0 ${step === 2 && "opacity-100"}`}>
              <div className="flex justify-center flex-col items-center">
                <Image src={Logo} alt="Logo" className="w-1/3 mb-[20px]" />
                <h2 className="text-dark font-semibold text-xl mt-2">Daftar Akun Creator</h2>
                <p className="text-grey text-sm text-center mb-3">Step 2 dari 3: Alamat & Kontak</p>
              </div>
              <div className="flex flex-col w-full px-5 gap-3">
                <div>
                  <TextInput 
                    labelProps={{ size: "xs" }} 
                    label="Lokasi / Kota Asal" 
                    placeholder="Misalnya Jakarta" 
                    mb={10} 
                    value={data.location} 
                    onChange={(e) => setData({ location: e.target.value })} 
                    error={errors.location} 
                  />
                </div>
                <div>
                  <TextInput 
                    labelProps={{ size: "xs" }} 
                    label="No. Telepon / Handphone" 
                    placeholder="Contoh: 08123456789" 
                    mb={10} 
                    value={data.phone_number} 
                    onChange={(e) => setData({ phone_number: e.target.value.replaceAll(/\D/g, '').replace(/^(?!0|6)(\d+)/, '628$1').replace(/^(0)/, '62') })} 
                    error={errors.phone_number} 
                  />
                </div>

                <div className="flex gap-2">
                  <button 
                    className="bg-gray-300 text-dark w-1/3 rounded-full p-2 text-xs" 
                    onClick={() => setStep(1)}
                  >
                    Kembali
                  </button>
                  <button 
                    className="bg-primary-base text-white w-2/3 rounded-full p-2 text-xs disabled:bg-primary-disabled disabled:opacity-50" 
                    onClick={() => setStep(3)}
                    disabled={!data.location || !data.phone_number}
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className={`transition-opacity duration-300 opacity-0 ${step === 3 && "opacity-100"}`}>
              <div className="flex justify-center flex-col items-center">
                <Image src={Logo} alt="Logo" className="w-1/3 mb-[20px]" />
                <h2 className="text-dark font-semibold text-xl mt-2">Daftar Akun Creator</h2>
                <p className="text-grey text-sm text-center mb-3">Step 3 dari 3: Image & Email</p>
              </div>
              <div className="flex flex-col w-full px-5 gap-3">
                <div>
                  <label className="block mb-2 text-xs font-medium text-dark">Image / Logo Creator</label>
                  <label className="w-full border-2 border-primary-light-200 rounded-lg border-dashed bg-primary-light flex flex-col items-center justify-center h-32 gap-2 cursor-pointer">
                    <input type="file" className="hidden" onChange={handleFile} accept=".jpg,.jpeg,.png" />
                    {image ? (
                      <Image
                        src={image}
                        alt="image"
                        className="object-contain"
                        width={120}
                        height={120}
                      />
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-base" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="font-semibold text-xs text-center">Unggah logo creator (Max 2MB)</h3>
                      </>
                    )}
                  </label>
                </div>
                <div>
                  <TextInput 
                    labelProps={{ size: "xs" }} 
                    label="Email" 
                    placeholder="Contoh: johndoe@xxxx.com" 
                    mb={10} 
                    value={data.email} 
                    onChange={(e) => setData({ email: e.target.value })} 
                    error={errors.email} 
                  />
                </div>

                <div className="flex gap-2">
                  <button 
                    className="bg-gray-300 text-dark w-1/3 rounded-full p-2 text-xs" 
                    onClick={() => setStep(2)}
                  >
                    Kembali
                  </button>
                  <button 
                    className="bg-primary-base text-white w-2/3 rounded-full p-2 text-xs disabled:bg-primary-disabled disabled:opacity-50" 
                    onClick={submitRegister}
                    disabled={!data.image || !data.email || loading}
                  >
                    {loading ? <Spinner color="default" size="sm" /> : "Selanjutnya"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className={`flex flex-col justify-center items-center transition-opacity duration-100 gap-4 ${step === 4 ? "opacity-100" : "opacity-0"}`}>
              <Image src={Logo} alt="Logo" className="w-1/3 mb-2" />
              <p className="text-primary-base font-semibold text-center">Verifikasi melalui email</p>
              <p className="text-dark text-xs font-semibold text-center px-5">
                Mohon periksa Email kamu. Kami telah mengirimkan kode ke <span className="text-primary-base">{data.email}</span>
              </p>
              <OTPInput
                value={otp}
                onChange={setOtp}
                inputType="tel"
                numInputs={6}
                renderSeparator={<span>-</span>}
                renderInput={(props) => <input {...props} />}
                containerStyle={{ width: "80%" }}
                inputStyle={{
                  border: "1px solid grey ",
                  borderRadius: "8px",
                  width: "100%",
                  height: "40px",
                  fontSize: "20px",
                  color: "#000",
                  fontWeight: "400",
                }}
              />
              {errors && <p className="text-danger text-[12px] mt-1">{errors.error}</p>}
              <div className="flex flex-col items-center w-full">
                {countdownEndTime && countdownActive && <Countdown date={countdownEndTime} renderer={renderer} />}
                {countdownActive ? (
                  <button className="bg-primary-base text-white w-1/2 rounded-full p-2 text-xs mt-3 hover:bg-primary-dark disabled:bg-primary-disabled" onClick={verifyRegister} disabled={loading || otp.length < 6}>
                    {loading ? <Spinner color="default" size="sm" /> : "Verifikasi"}
                  </button>
                ) : (
                  <button className="bg-primary-base text-white w-1/2 rounded-full p-2 text-xs mt-3 hover:bg-primary-dark disabled:bg-primary-disabled" onClick={handleResendOtp} disabled={loading}>
                    {loading ? <Spinner color="default" size="sm" /> : "Kirim Ulang Kode"}
                  </button>
                )}
              </div>
            </div>
          )}
          {step === 5 && (
            <div className={`transition-opacity duration-300 opacity-0 ${step === 5 && "opacity-100"}`}>
              <div className="flex justify-center flex-col items-center">
                <Image src={Logo} alt="Logo" className="w-1/3 mb-[20px]" />
                <h2 className="text-dark font-semibold text-xl mt-2">Set Password</h2>
                <p className="text-grey text-sm text-center mb-3">Buat password untuk akun creator Anda</p>
              </div>
              <div className="flex flex-col w-full px-5 gap-3">
                <div>
                  <PasswordInput 
                    labelProps={{ size: "xs" }} 
                    label="Password" 
                    placeholder="Masukan Password" 
                    value={data.password} 
                    onChange={(e) => setData({ password: e.target.value })} 
                    error={errors.password} 
                  />
                </div>
                <div>
                  <PasswordInput
                    labelProps={{ size: "xs" }}
                    label="Konfirmasi Password"
                    placeholder="Masukan Konfirmasi Password"
                    value={data.password_confirm}
                    onChange={(e) => setData({ password_confirm: e.target.value })}
                    error={errors.password_confirm}
                  />
                </div>

                <button 
                  className="bg-primary-base mt-[20px] mb-[20px] text-white w-full rounded-full p-2 text-xs disabled:bg-primary-disabled disabled:opacity-50" 
                  onClick={submitCreator}
                  disabled={!data.password || !data.password_confirm || loading}
                >
                  {loading ? <Spinner color="default" size="sm" /> : "Buat Akun Creator"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;

// import React, { useEffect, useState } from "react";
// import Logo from "@images/kolektix logo tansparant-blue.png";
// import LogoWhite from "@images/kolektix.gif";
// import OTPInput from "react-otp-input";
// import { faMessage } from "@fortawesome/free-solid-svg-icons";
// import Cookies from "js-cookie";
// import { useRouter } from "next/router";
// import useLoggedUser from "@/utils/useLoggedUser";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import Image from "next/image";
// import { Spinner } from "@nextui-org/react";
// import { Get, Post } from "@/utils/REST";
// import { toast } from "react-toastify";
// import Countdown, { CountdownRendererFn } from "react-countdown";
// import { PasswordInput, TextInput } from "@mantine/core";
// import { useSetState } from "@mantine/hooks";
// import { UserProps } from "@/utils/globalInterface";

// interface RegisterForm {
//   name: string;
//   email: string;
//   password: string;
//   password_confirm: string;
//   otp_code: string;
// }

// interface ErrorRegisterProps {
//   [key: string]: string[];
// }

// const Form = ({ placeholder, label, onChange, value, type }: { placeholder: string; label?: string; onChange?: (e: any) => void; value?: string; type?: string }) => {
//   return (
//     <div>
//       <label htmlFor="email" className="block mb-2 ml-1 text-[12px] font-medium text-dark">
//         {label}
//         <input type={type ? type : "text"} name="" id="" placeholder={placeholder} value={value} className="bg-[#e2edfc] py-2 px-3 text-xs w-full text-dark rounded-full" onChange={onChange} />{" "}
//       </label>
//     </div>
//   );
// };

// const Auth = () => {
//   const router = useRouter();
//   const [step, setStep] = useState<number>(0);
//   const [otp, setOtp] = useState<string>("");
//   const [data, setData] = useSetState<RegisterForm>({
//     name: "",
//     email: "",
//     password: "",
//     password_confirm: "",
//     otp_code: "",
//   });
//   const [imageOpacity, setImageOpacity] = useState<number>(0);
//   const [errors, setErrors] = useSetState<Partial<RegisterForm & { message: string; error: string }>>({});
//   const [errorRegister, setErrorRegister] = useState<ErrorRegisterProps>({});
//   const [loading, setLoading] = useState<boolean>(false);
//   const [countdownEndTime, setCountdownEndTime] = useState<Date | null>(null);
//   const [countdownActive, setCountdownActive] = useState<boolean>(false);
//   const users = useLoggedUser();

//   const ticketCount = Cookies.get("ticketCount");
//   const prevPath = Cookies.get("prevPath");

//   useEffect(() => {
//     if (users?.id) {
//       router.push("/");
//       toast.warning("Anda Sudah Login");
//     }
//     //eslint-disable-next-line
//   }, [users]);

//   const Completionist = () => (
//     <button className="text-dark w-full rounded-full p-2 text-xs font-semibold flex items-center gap-2 hover:text-primary-base" onClick={handleResendOtp}>
//       Kirim Ulang
//     </button>
//   );

//   const renderer: CountdownRendererFn = ({ minutes, seconds, completed }) => {
//     if (completed) {
//       setCountdownActive(false);
//     } else {
//       return (
//         <span className="text-dark w-full text-center">
//           {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
//         </span>
//       );
//     }
//   };

//   const handleResendOtp = () => {
//     setCountdownEndTime(new Date(Date.now() + 120000));
//     setCountdownActive(true);
//     login();
//   };

//   useEffect(() => {
//     setErrors({
//       name: undefined,
//       email: undefined,
//       password: undefined,
//       password_confirm: undefined,
//       otp_code: undefined,
//       message: undefined,
//       error: undefined,
//     });
//   }, [data, step]);

//   const submitRegister = (event?: React.FormEvent) => {
//     event?.preventDefault();

//     if (data.name == "") setErrors({ name: "Wajib Diisi" });
//     if (data.email == "") setErrors({ email: "Wajib Diisi" });
//     if (data.password == "") setErrors({ password: "Wajib Diisi" });
//     if (data.password.length < 8) setErrors({ password: "Minimal 8 Karakter" });
//     if (data.password != data.password_confirm) setErrors({ password_confirm: "Password Tidak Sama" });
//     if (Object.values(errors).filter((e) => !!e).length > 0) return;

//     setLoading(true);
//     Post("register-auth", data)
//       .then((res: any) => {
//         setLoading(false);
//         setCountdownEndTime(new Date(Date.now() + 120000));
//         setCountdownActive(true);
//         setStep(3);
//         console.log(res);
//       })
//       .catch((err: any) => {
//         setLoading(false);
//         console.log(err);
//         setErrors(err.response.data);
//       });
//   };

//   const getPermission = async () => {
//     try {
//       console.log("🔍 [getPermission] Fetching permissions...");
//       const res = (await Get("permissions", {})) as any;
      
//       // DEBUG: Cek ukuran data
//       const dataSize = JSON.stringify(res.data).length;
//       console.log(`📊 [getPermission] Data size: ${dataSize} characters`);
      
//       if (dataSize > 4000) {
//         console.warn("⚠️ [getPermission] Cookie might exceed 4KB limit!");
        
//         // Solusi: Simpan hanya data yang diperlukan
//         const minimalPermissions = res.data.map((p: any) => ({
//           id: p.id,
//           module_id: p.module_id,
//           is_index: p.is_index,
//           is_view: p.is_view,
//           is_update: p.is_update,
//           is_delete: p.is_delete,
//         }));
        
//         const minimalSize = JSON.stringify(minimalPermissions).length;
//         console.log(`📊 [getPermission] Minimal data size: ${minimalSize} characters`);
        
//         await Cookies.set("permissions", JSON.stringify(minimalPermissions));
//       } else {
//         await Cookies.set("permissions", JSON.stringify(res.data));
//       }
      
//       console.log("✅ [getPermission] Permissions saved to cookie");
//       return true;
//     } catch (error) {
//       console.error("❌ [getPermission] Error:", error);
//       throw error;
//     }
//   };

//   const login = async (event?: React.FormEvent) => {
//     event?.preventDefault();

//     console.log("🔑 [login] Starting login process...");

//     if (data.email == "") setErrors({ email: "Wajib Diisi" });
//     if (data.password == "") setErrors({ password: "Wajib Diisi" });
//     if (Object.values(errors).filter((e) => !!e).length > 0) return;

//     setLoading(true);
    
//     Post("login-auth", data)
//       .then(async (res: any) => {
//         try {
//           console.log("✅ [login] API response received");
//           console.log("📦 [login] Response keys:", Object.keys(res));
          
//           // DEBUG: Simpan response untuk inspeksi
//           localStorage.setItem('last_login_response', JSON.stringify(res));
          
//           // 1. Coba tanpa getPermission() dulu untuk testing
//           console.log("🔄 [login] Getting permissions...");
//           await getPermission();
//           console.log("✅ [login] Permissions fetched");
          
//           // 2. Set token
//           console.log("🔐 [login] Setting token cookie...");
//           Cookies.set("token", res.access_token);
          
//           // 3. Tentukan role
//           console.log("👤 [login] Determining role...");
//           const role: UserProps["role"] = res?.user_access?.some((e: any) => e?.has_role.id == 3) 
//             ? "Creator" 
//             : res?.user_access?.some((e: any) => e?.has_role?.name == "Admin") 
//               ? "Admin" 
//               : "Staff";
          
//           console.log(`🎯 [login] Role: ${role}`);
          
//           // 4. Set user_data cookie (minimal dulu)
//           console.log("📝 [login] Setting user_data cookie...");
//           const userData = {
//             id: res?.data?.id,
//             email: res?.data?.email,
//             name: res?.data?.name,
//             force_creator: true,
//             role,
//           };
          
//           // Cek ukuran cookie
//           const userDataStr = JSON.stringify(userData);
//           console.log(`📊 [login] user_data size: ${userDataStr.length} characters`);
          
//           if (userDataStr.length > 4000) {
//             console.warn("⚠️ [login] user_data cookie too large, reducing...");
//             // Hanya simpan data penting
//             const minimalUserData = {
//               id: res?.data?.id,
//               role,
//             };
//             Cookies.set("user_data", JSON.stringify(minimalUserData));
//           } else {
//             Cookies.set("user_data", JSON.stringify(userData));
//           }
          
//           console.log("✅ [login] Cookies set successfully");
          
//           // 5. Redirect
//           const redirectPath = role == "Admin" ? "/dashboard/admin" : "/dashboard";
//           console.log(`📍 [login] Redirecting to: ${redirectPath}`);
          
//           setLoading(false);
          
//           // SOLUSI: Coba berbagai metode redirect
//           const redirectStrategies = [
//             () => {
//               console.log("🔄 Attempting router.push()...");
//               router.push(redirectPath);
//             },
//             () => {
//               console.log("🔄 Attempting window.location.href...");
//               window.location.href = redirectPath;
//             },
//             () => {
//               console.log("🔄 Attempting window.location.assign()...");
//               window.location.assign(redirectPath);
//             }
//           ];
          
//           // Coba metode pertama, jika tidak bekerja dalam 2 detik, coba yang lain
//           redirectStrategies[0]();
          
//           setTimeout(() => {
//             // Cek jika masih di halaman login setelah 2 detik
//             if (window.location.pathname.includes('/login')) {
//               console.warn("⚠️ Router.push() failed, trying alternative...");
//               redirectStrategies[1]();
//             }
//           }, 2000);
          
//         } catch (error: any) {
//           console.error("❌ [login] Error in success handler:", error);
//           setLoading(false);
//           toast.error(`Error: ${error.message || "Unknown error"}`);
//         }
//       })
//       .catch((err: any) => {
//         console.error("❌ [login] API error:", err);
//         if (err.response?.status === 401) {
//           toast.error("Email belum terdaftar. Silahkan registrasi terlebih dahulu");
//           setStep(1);
//         }
//         setErrors(err.response?.data || { message: "Network error" });
//         setLoading(false);
//       });
//   };

//   const verifyRegister = () => {
//     setLoading(true);
//     Post("verify-register", data)
//       .then((res: any) => {
//         console.log(res);
//         Cookies.set("token", res.access_token);
//         Cookies.set("user_data", JSON.stringify({ ...res.data, force_creator: true, role: "Staff" }));
//         setLoading(false);
        
//         // Gunakan window.location untuk redirect
//         window.location.href = "/dashboard";
//       })
//       .catch((err: any) => {
//         setOtp("");
//         console.log(err.response.data.message);
//         setErrors(err.response.data);
//         setLoading(false);
//       });
//   };

//   const verifyLogin = () => {
//     setLoading(true);
//     Post("verify-login", data)
//       .then((res: any) => {
//         console.log(res);
//         Cookies.set("token", res.access_token);
//         Cookies.set("user_data", JSON.stringify({ ...res.data, force_creator: true, role: "Staff" }));
//         Cookies.set("bookmarked", JSON.stringify(res.bookmarked));
//         setLoading(false);
        
//         // Gunakan window.location untuk redirect
//         window.location.href = "/dashboard";
//       })
//       .catch((err: any) => {
//         setOtp("");
//         console.log(err.response.data.error);
//         setErrors(err.response.data);
//         setLoading(false);
//       });
//   };

//   useEffect(() => {
//     setImageOpacity(1);
//   }, []);

//   const [displayedText, setDisplayedText] = useState<string>("");

//   useEffect(() => {
//     setImageOpacity(1);
//   }, []);

//   useEffect(() => {
//     const text = "Masa Depan Tongkrongan";
//     let index = 0;

//     const interval = setInterval(() => {
//       setDisplayedText((prev) => prev + text[index - 1]);
//       index += 1;
//       if (index === text.length) {
//         clearInterval(interval);
//       }
//     }, 150);

//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     setData({ ...data, otp_code: otp });
//     //eslint-disable-next-line
//   }, [otp]);

//   return (
//     <div className="flex min-h-screen justify-center items-center bg-primary-base px-5 !py-4 md:px-20">
//       <div className="lg:w-1/2 xs:hidden md:flex flex-col justify-center items-center gap-8">
//         <Image
//           src={LogoWhite}
//           alt="logo"
//           style={{
//             opacity: imageOpacity,
//             transition: "opacity 1.5s ease-in-out",
//           }}
//         />
//       </div>
//       <div className="sm:w-full lg:max-w-[450px] flex flex-col justify-center items-center lg:px-10 max-w-xl">
//         <div className="bg-white rounded-2xl flex flex-col justify-center w-full pt-6 pb-2 px-6">
//           {step === 0 && (
//             <div className={`flex flex-col justify-center items-center transition-opacity duration-100 ${step === 0 ? "opacity-100" : "opacity-0"}`}>
//               <Image src={Logo} alt="Logo" className="w-1/2" />
//               <h2 className="text-dark font-semibold text-xl mt-4 text-center">Masuk sebagai Creator/Staff</h2>
//               <div className="flex">
//                 <p className="text-grey text-[12px] mb-2 text-center">
//                   Masukan akunmu yang sudah terdaftar sebagai Creator/Staff,
//                   <span
//                     className="cursor-pointer text-primary-base font-semibold"
//                     onClick={() => {
//                       setStep(1);
//                     }}
//                   >
//                     {" "}
//                     Daftar Akun
//                   </span>
//                 </p>
//               </div>
//               <div className="flex flex-col w-full mt-2">
//                 <form onSubmit={login}>
//                   <TextInput labelProps={{ size: "xs" }} label="Email" placeholder="Masukan Email" mb={10} value={data.email} onChange={(e) => setData({ email: e.target.value })} error={errors.email} />
//                   <PasswordInput labelProps={{ size: "xs" }} label="Password" placeholder="Masukan Password" value={data.password} onChange={(e) => setData({ password: e.target.value })} error={errors.password} />
                  
//                   {errors && <p className="text-danger text-[10px] mt-1">{errors.message}</p>}
                  
//                   <button 
//                     className="bg-primary-base text-white w-full rounded-full p-2 text-xs my-4 flex items-center justify-center disabled:bg-primary-disabled" 
//                     type="submit" 
//                     onClick={login} 
//                     disabled={loading}
//                   >
//                     {loading ? <Spinner color="default" size="sm" /> : "Selanjutnya"}
//                   </button>
                  
//                   {/* DEBUG INFO */}
//                   <div className="mt-2 text-xs text-gray-500">
//                     <p>Check Console (F12) for debug logs</p>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           )}
//           {step === 1 && (
//             <div className={`transition-opacity duration-300 opacity-0 ${step === 1 && "opacity-100"}`}>
//               <div className="flex justify-center flex-col items-center">
//                 <Image src={Logo} alt="Logo" className="w-1/3 mb-[20px]" />
//                 <h2 className="text-dark font-semibold text-xl mt-2">Daftar Akun Staff</h2>
//                 <div className="flex">
//                   <p className="text-grey text-sm text-center mb-3">
//                     Sudah punya akun?
//                     <span
//                       className="cursor-pointer text-primary-base font-semibold"
//                       onClick={() => {
//                         setStep(0);
//                       }}
//                     >
//                       {" "}
//                       Masuk
//                     </span>
//                   </p>
//                 </div>
//               </div>
//               <div className="flex flex-col w-full px-5">
//                 <div>
//                   <TextInput labelProps={{ size: "xs" }} label="Nama Lengkap" placeholder="Masukan Nama Lengkap" mb={10} value={data.name} onChange={(e) => setData({ name: e.target.value })} error={errors.name} />
//                 </div>
//                 <div>
//                   <TextInput labelProps={{ size: "xs" }} label="Email" placeholder="Masukan Email" mb={10} value={data.email} onChange={(e) => setData({ email: e.target.value })} error={errors.email} />
//                   <PasswordInput labelProps={{ size: "xs" }} label="Password" placeholder="Masukan Password" value={data.password} onChange={(e) => setData({ password: e.target.value })} error={errors.password} />
//                   <PasswordInput
//                     mt={10}
//                     labelProps={{ size: "xs" }}
//                     label="Konfirmasi Password"
//                     placeholder="Masukan Konfirmasi Password"
//                     value={data.password_confirm}
//                     onChange={(e) => setData({ password_confirm: e.target.value })}
//                     error={errors.password_confirm}
//                   />
//                 </div>

//                 <button className="bg-primary-base mt-[20px] mb-[20px] text-white w-full rounded-full p-2 text-xs" onClick={submitRegister}>
//                   {loading ? <Spinner color="default" size="sm" /> : "Selanjutnya"}
//                 </button>
//               </div>
//             </div>
//           )}
//           {step === 2 && (
//             <div className={`flex flex-col justify-center items-center transition-opacity duration-100 gap-4 ${step === 2 ? "opacity-100" : "opacity-0"}`}>
//               <p className="text-primary-base font-semibold text-center">Verifikasi melalui email</p>
//               <p className="text-dark text-xs font-semibold text-center px-5">
//                 Mohon periksa Email kamu. Kami telah mengirimkan kode ke <span className="text-primary-base">{data.email}</span>
//               </p>
//               <OTPInput
//                 value={otp}
//                 onChange={setOtp}
//                 inputType="tel"
//                 numInputs={6}
//                 renderSeparator={<span>-</span>}
//                 renderInput={(props) => <input {...props} />}
//                 containerStyle={{ width: "80%" }}
//                 inputStyle={{
//                   border: "1px solid grey ",
//                   borderRadius: "8px",
//                   width: "100%",
//                   height: "40px",
//                   fontSize: "20px",
//                   color: "#000",
//                   fontWeight: "400",
//                 }}
//               />
//               {errors && <p className="text-danger text-[12px] mt-1">{errors.error}</p>}
//               <div className="flex flex-col items-center w-full">
//                 {countdownEndTime && countdownActive && <Countdown date={countdownEndTime} renderer={renderer} />}
//                 {countdownActive ? (
//                   <button className="bg-primary-base text-white w-1/2 rounded-full p-2 text-xs mt-3 hover:bg-primary-dark disabled:bg-primary-disabled" onClick={verifyLogin} disabled={loading || otp.length < 6}>
//                     {loading ? <Spinner color="default" size="sm" /> : "Verifikasi"}
//                   </button>
//                 ) : (
//                   <button className="bg-primary-base text-white w-1/2 rounded-full p-2 text-xs mt-3 hover:bg-primary-dark disabled:bg-primary-disabled" onClick={handleResendOtp} disabled={loading}>
//                     {loading ? <Spinner color="default" size="sm" /> : "Kirim Ulang Kode"}
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}
//           {step === 3 && (
//             <div className={`flex flex-col justify-center items-center transition-opacity duration-100 gap-5 ${step === 3 ? "opacity-100" : "opacity-0"}`}>
//               <p className="text-primary-base font-semibold text-center">Verifikasi melalui email</p>
//               <p className="text-dark text-xs font-semibold text-center">Mohon periksa Email kamu. Kami telah mengirimkan kode ke {data.email}</p>
//               <OTPInput
//                 value={otp}
//                 onChange={setOtp}
//                 numInputs={6}
//                 inputType="tel"
//                 renderSeparator={<span>-</span>}
//                 renderInput={(props) => <input {...props} />}
//                 containerStyle={{ width: "80%" }}
//                 inputStyle={{
//                   border: "1px solid grey ",
//                   borderRadius: "8px",
//                   width: "100%",
//                   height: "40px",
//                   fontSize: "20px",
//                   color: "#000",
//                   fontWeight: "400",
//                 }}
//               />
//               {errors && <p className="text-danger text-[10px] mt-1">{errors.error}</p>}

//               <div className="flex flex-col items-center w-full">
//                 {countdownEndTime && countdownActive && <Countdown date={countdownEndTime} renderer={renderer} />}
//                 {countdownActive ? (
//                   <button className="bg-primary-base text-white w-1/2 rounded-full p-2 text-xs mt-3 hover:bg-primary-dark disabled:bg-primary-disabled" onClick={verifyRegister} disabled={loading || otp.length < 6}>
//                     {loading ? <Spinner color="default" size="sm" /> : "Verifikasi"}
//                   </button>
//                 ) : (
//                   <button className="bg-primary-base text-white w-1/2 rounded-full p-2 text-xs mt-3 hover:bg-primary-dark disabled:bg-primary-disabled" onClick={handleResendOtp} disabled={loading}>
//                     {loading ? <Spinner color="default" size="sm" /> : "Kirim Ulang"}
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Auth;