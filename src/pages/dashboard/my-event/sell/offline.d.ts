import { IdentityProps } from "@/components/Modals/ModalOfflineSales";

interface PaymentMethod {
    id: number;
    payment_type_id: number;
    payment_name: string;
    account_no: string | null;
    account_name: string;
    account_branch: string;
    description: string | null;
    status: string | null;
    image: string | null;
    created_by: string | null;
    updated_by: string | null;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
    logo: string | null;
}

interface Event {
    id: number;
    creator_id: string;
    event_social_media_id: string | null;
    category_id: string | null;
    name: string;
    slug: string;
    image: string;
    image_thumbnail: string | null;
    event_format_id: number;
    event_topic_id: number;
    tag: string;
    event_type_id: number;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    zone_time: string;
    organization_method: string;
    location_name: string;
    location_city: string;
    location_address: string;
    location_map: string;
    longitude: number | null;
    latitude: number | null;
    is_name: number;
    is_phone_number: number;
    is_birthdate: number;
    is_email: number;
    is_noidentity: number;
    is_gender: number;
    one_email_ticket: number;
    one_id_one_ticket: number;
    max_buy_ticket: number;
    ppn: string | null;
    admin_fee: string | null;
    admin_fee_plus: string | null;
    starting_price: number;
    description: string;
    term_condition: string;
    save_as_draft: string;
    event_status_id: number;
    activity_status: number;
    allowed_payment_method: string | null;
    created_by: string;
    updated_by: string | null;
    main_status: string | null;
    upcoming: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    payment_method_custom: string | null;
    image_url: string;
    thumbnail_url: string;
}

interface Ticket {
    id: number;
    transaction_id: string;
    event_id: string;
    etiket_number: string | null;
    event_ticket_id: string;
    qty_ticket: number;
    price: number;
    subtotal_price: number;
    payment_status: string;
    ticket_checkin_status: number;
    created_by: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    code: string;
    has_event_ticket: {
        id: number;
        event_id: string;
        ticket_type_id: number;
        ticket_category: string;
        name: string;
        description: string;
        qty: number;
        sold_qty: number;
        price: number;
        event_schedule_date: string;
        ticket_date: string;
        starting_time: string;
        ticket_end: string;
        ending_time: string | null;
        is_soldout: number;
        is_finish: number;
        is_ready: number;
        is_fullbook: number;
        created_by: string | null;
        updated_by: string | null;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
        max_buy_ticket: number | null;
        ticket_sold: number | null;
        ticket_type: string;
    };
}

interface Transaction {
    id: number;
    event_id: string;
    invoice_no: string;
    user_id: string | null;
    total_qty: string;
    total_price: string;
    grandtotal: string;
    admin_fee: string | null;
    ppn: string | null;
    payment_method: PaymentMethod;
    payment_status: string;
    payment_channel_id: string | null;
    total_payment_charge: string | null;
    created_by: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    check_in_status: string | null;
    type_transaction: string;
    xendit_url: string | null;
    admin_fee_plus: string | null;
    transaction_status_id: string | null;
    payment_date: string | null;
    has_user: string | null;
    has_event: Event;
    identities: {
        nik: string;
        full_name: string;
        email: string;
        no_telp: string;
        is_pemesan: string;
        identity_type_id: string | number;
        event_ticket_id: string | number;
    }[];
    tickets: Ticket[];
}

export type ResponseData = {
    message: string;
    data: Transaction[];
    grand_total: number;
    pagination: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
}
