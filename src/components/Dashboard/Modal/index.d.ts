interface EventInvitationResponse {
    id: number;
    event_id: number;
    invitation_cat_id: number;
    invitation_title: string;
    invitation_description: string;
    total_qty: number;
    invitation_status: string | null;
    created_by: string;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    image: string | null;
    is_banner_event: boolean | null;
    event_invitation_detail: EventInvitationDetail[];
}

interface EventInvitationDetail {
    id: number;
    event_invitation_id: number;
    invitation_number: string;
    identity_no: string | null;
    fullname: string;
    email: string;
    phone: string;
    recived_status: number;
    attendance_status: number;
    is_checkin: number;
    checkin_date: string;
    is_checkout: number;
    checkout_date: string | null;
    scan_checkin_by: string | null;
    scan_checkout_by: string | null;
    created_by: string;
    updated_by: string | null;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
}