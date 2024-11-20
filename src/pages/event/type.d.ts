interface PaymentChannel {
    id: number;
    payment_link_id: number;
    payment_method: string;
    payment_channel: string;
    type: string;
    fee: number;
    ppn: number;
    image: string | null;
    instruction: string;
    expired_time: number;
    active: string;
}

interface PaymentLink {
    id: number;
    payment_method_id: number;
    group: string;
    description: string | null;
    active: number;
    deleted_at: string | null;
    has_payment_channel: PaymentChannel[];
}

interface PaymentMethod {
    id: number;
    payment_type_id: number;
    payment_name: string;
    account_no: string;
    account_name: string;
    account_branch: string;
    description: string;
    status: string;
    image: string | null;
    created_by: string | null;
    updated_by: string | null;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
    logo: string;
    has_payment_link: PaymentLink[];
}
