import { formatDateNoCheck, formatDay, formatYear } from "@/utils/useFormattedDate";
import useLoggedUser from "@/utils/useLoggedUser";
import { Alert } from "@mantine/core";

type ComponentProps = {
    
};

export default function DashboardUser({  }: Readonly<ComponentProps>) {
    const user = useLoggedUser();
    const now = new Date();

    return (
        <div className="w-full text-dark">
            <div className="flex flex-col gap-2 px-4 py-4 md:px-7 md:py-4 w-full bg-gradient-to-b from-white to-[#f5f5f5]">
                <h1 className='mb-4 text-dark'>Dashboard</h1>
                <p className="text-dark-grey mb-1">
                    {formatDay(now.toString())} &bull; {formatDateNoCheck(now.toString())},{' '}
                    {formatYear(now.toString())}
                </p>
                <h3 className="font-semibold text-xl md:text-2xl">Halo, {user?.name}</h3>
                {/* <p className="text-sm text-dark-grey">Pantau dan kelola event, lowongan, dan merchandise</p> */}
            </div>
            <Alert>
                Akunmu belum terverifikasi, verifikasi akun sekarang
            </Alert>
        </div>
    );
}