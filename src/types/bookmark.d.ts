import { EventProps, VenueProps } from "@/utils/globalInterface";

export type BookmarkRequest = {
    module_id: number;
    type: string;
    event_id?: number;
    product_id?: number;
    lowongan_id?: number;
    talenta_id?: number;
    venue_id?: number;
}

export type BookmarkListResponse = {
    id: number;
    user_id: number;
    module_id: number;
    type: string;
    event_id: number;
    product_id: number | null;
    lowongan_id: number | null;
    talenta_id: number | null;
    feature_id: number;
    venue_id?: number;
    has_event: EventProps;
    has_venue: VenueProps;
}