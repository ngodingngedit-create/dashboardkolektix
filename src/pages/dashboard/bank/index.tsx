import { useState, useEffect } from "react";
import bankEmpty from "../../../assets/icon/bank.png";
import Image from "next/image";
import Button from "@/components/Button";
import ModalBankForm from "@/components/Modals/ModalBankForm";
import { Delete, Get } from "@/utils/REST";
import { UserProps } from "@/utils/globalInterface";
import useLoggedUser from "@/utils/useLoggedUser";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusSquare } from "@fortawesome/free-regular-svg-icons";
import ModalConfirmation from "@/components/Modals/ModalConfirmation";
import { toast } from "react-toastify";

interface BankProps {
  id: number;
  user_id: number;
  type_bank: string;
  account_name: string;
  account_number: string;
  status: "active" | "inactive";
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

const Bank = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<BankProps[]>([]);
  const [itemId, setItemId] = useState<number>(-1);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const user = useLoggedUser();
  const getData = () => {
    Get(`bank-by-user/${user?.id}`, {})
      .then((res: any) => {
        setData(res.data);
        console.log(res);
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  const deleteData = (id: number) => {
    Delete(`user-bank/${id}`, {})
      .then((res: any) => {
        setConfirmDelete(false);
        toast.success("Akun bank berhasil dihapus");
        getData();
        console.log(res);
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (user) {
      getData();
    }
  }, [user]);
  return (
    <div className="p-10">
      {data.length > 0 ? (
        <div className="border-2 border-primary-light-200 text-dark rounded-lg">
          {data.map((item: BankProps) => (
            <div className="flex justify-between items-center px-5 py-4 border-b-2 border-b-primary-light-200" key={item.id}>
              <div className="flex items-center gap-4">
                <div className="border-2 border-primary-light-200 bg-primary-light rounded-md w-10 h-10 flex items-center justify-center mb-2">
                  <Image src={bankEmpty} alt="bank" />
                </div>
                <div>
                  <p className="font-semibold">{item.type_bank}</p>
                  <p className="text-grey">{item.account_number}</p>
                  <p className="text-grey">a.n {item.account_name}</p>
                </div>
              </div>
              <button
                className="w-10 h-10 rounded-full text-primary-dark border-2 border-primary-light-200 hover:text-white hover:bg-primary-dark transition-colors"
                onClick={() => {
                  setItemId(item.id);
                  setConfirmDelete(!confirmDelete);
                }}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-4 p-5">
            <button className="w-10 h-10 bg-primary-dark text-white rounded-lg hover:text-primary-dark hover:bg-primary-light-200 transition-colors" onClick={() => setIsOpen(true)}>
              <FontAwesomeIcon icon={faPlusSquare} size="xl" />
            </button>
            <div>
              <p className="font-semibold">Tambah Rekening</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-[90vh] flex flex-col items-center justify-center text-dark gap-2">
          <div className="border-2 border-primary-light-200 bg-primary-light rounded-md w-10 h-10 flex items-center justify-center mb-2">
            <Image src={bankEmpty} alt="bank" />
          </div>
          <p className="font-semibold text-lg">Belum ada rekening yang disimpan</p>
          <p className="text-grey">Tambah rekening bank kamu untuk memudahkan penarikan K-Wallet</p>
          <Button label="Tambah Rekening" color="primary" className="mt-4" onClick={() => setIsOpen(true)} />
        </div>
      )}
      <ModalBankForm isOpen={isOpen} setIsOpen={setIsOpen} user={user} getData={getData} />
      <ModalConfirmation isOpen={confirmDelete} setIsOpen={setConfirmDelete} onConfirm={() => deleteData(itemId)} message={"Apakah anda yakin ingin menghapus rekening ini?"} />
    </div>
  );
};

export default Bank;
