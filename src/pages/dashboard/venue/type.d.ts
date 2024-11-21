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

interface VenueFacility {
    id: number;
    name: string;
    description: string;
    status: string;
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
    id: number;
    creator_id?: number;
    venue_category_id: number;
    venue_capacity_id: number;
    venue_facility_id: string;
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
    image_url: string;
    creator: CreatorProps;
    has_venue_category?: VenueCategory;
    has_venue_capacity?: VenueCapacity;
    has_venue_schedule?: VenueSchedule;
    venue_gallery: {
        image_url: string;
    }[];
}

export type VenueListResponse = Venue;
export type VenueStoreRequest = {
    creator_id: number;
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
    description: string;
    status: string;
    image: Blob[];
}
export type VenueGalleryStoreRequest = {
    venue_id: number;
    name: string;
    description: string;
    status: string;
    image: string;
}