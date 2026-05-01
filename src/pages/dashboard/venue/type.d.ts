import { CreatorProps } from "@/utils/globalInterface";

interface VenueCategory {
    id: number;
    name: string;
    description: string;
    status: string;
    created_by: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface VenueRule {
    id?: number;
    venue_id?: number;
    title: string;
    description: string | null;
    sort_order: number;
}

export interface VenueFaq {
    id?: number;
    venue_id?: number;
    question: string;
    answer: string;
}


interface VenueFacility {
    id: number;
    venue_id: number;
    facility_id: number;
    facility_name: string | null;
    facility_description: string | null;
    created_at: string;
}

interface BlockedDate {
    id?: number;
    venue_id?: number;
    start_date: string;
    end_date: string;
    reason: string;
}

interface VenueCapacity {
    id: number;
    name: string;
    capacity: number;
    description: string;
    status: string;
    created_by: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

interface VenueSchedule {
    id: number;
    venue_id: number;
    name: string;
    image: string | null;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    created_by: string | null;
    updated_by: string | null;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
}

interface Venue {
    id?: number;
    creator_id?: number;
    venue_category_id?: number;
    venue_capacity_id?: number;
    venue_facility_id?: number[];
    name: string;
    slug: string;
    image: string;
    description: string;
    location: string;
    location_map: string;
    location_detail: string;
    opening_hour: string;
    max_capacity: number;
    seat_capacity: number;
    opening_hour: string;
    contact_person_name: string;
    contact_person_email: string;
    contact_person_phone: string;
    status: string;
    venue_schedule_id: number;
    created_by: string | null;
    updated_by: string | null;
    created_at: string | null;
    updated_at: string;
    deleted_at: string | null;
    starting_price: number;
    minimum_price?: number;
    per_hour_price?: number;
    image_url: string;
    creator: CreatorProps;
    has_venue_category?: VenueCategory;
    has_venue_capacity?: VenueCapacity;
    has_venue_schedule?: VenueSchedule;
    venue_gallery: {
        image_url: string;
    }[];
    has_booked_venue?: {
        event_name: string;
        event_banner: string;
        start_date: string;
        end_date: string;
    }[]
    has_booking_venue?: any[];
    facility?: string[];
    blocked_dates?: BlockedDate[];
    rules?: VenueRule[];
    faqs?: VenueFaq[];
}


export type VenueListResponse = Venue;
export type VenueStoreRequest = {
    venue_category_id: number;
    venue_capacity_id: number;
    venue_facility_id: number[];
    venue_schedule_id: number;
    name: string;
    location: string;
    location_map: string;
    location_detail: string;
    opening_hour: string;
    max_capacity: number;
    seat_capacity: number;
    contact_person_name: string;
    contact_person_email: string;
    contact_person_phone: string;
    starting_price: number;
    minimum_price: number;
    per_hour_price?: number;
    description: string;
    status: string;
    image: (string | Blob)[];
    blocked_dates?: {
        start_date: string;
        end_date: string;
        reason: string;
    }[];
    rules?: {
        title: string;
        description?: string | null;
        sort_order?: number;
    }[];
    faqs?: {
        question: string;
        answer: string;
    }[];
}

export type VenueGalleryStoreRequest = {
    venue_id: number;
    name: string;
    description: string;
    status: string;
    image: string;
}