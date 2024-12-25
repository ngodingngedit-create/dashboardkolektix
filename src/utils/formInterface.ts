export interface EventTicket {
  ticket_type: string;
  ticket_category_id: number;
  ticket_category: 'Seated' | 'Festival';
  starting_time?: string;
  ending_time?: string;
  name: string;
  ticket_date: string | null;
  ticket_end: string | null;
  qty: number;
  price: number;
  description: string;
  available_seat?: string[];
  seat_color?: string;
}

export interface FormEvent {
  creator_id: number;
  name: string;
  image: string;
  event_format_id: number;
  event_topic_id: number;
  tag: string;
  event_type_id: number;
  start_date: string | null;
  end_date: string | null;
  start_time: string;
  end_time: string;
  zone_time: string;
  organization_method: string;
  location_name: string;
  location_city: string;
  location_address: string;
  location_map: string;
  longitude: string;
  latitude: string;
  is_name: boolean;
  is_phone_number: boolean;
  is_birthdate: boolean;
  is_email: boolean;
  is_noidentity: boolean;
  is_gender: boolean;
  max_buy_ticket: number;
  one_email_ticket: boolean;
  one_id_one_ticket: boolean;
  description: string;
  term_condition: string;
  save_as_draft: boolean;
  tickets: EventTicket[];
  seatmap?: string;
}

export type SeatmapData = {
  type?: string;
  text?: string;
  row?: number;
  prefix?: string;
  col?: number;
  position: [number, number];
  size?: [number, number];
  rotation?: number;
  background?: string;
  seatcolor?: string;
  seat?: string[][];
};