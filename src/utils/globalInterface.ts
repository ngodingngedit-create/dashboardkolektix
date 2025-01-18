import { EXPORT_DETAIL } from 'next/dist/shared/lib/constants';
import { SeatmapData } from './formInterface';

export interface TicketProps {
  id: number;
  event_id: string;
  name: string;
  qty: number;
  price: number;
  description: string;
  ticket_date: string;
  starting_time?: string;
  ending_time?: string;
  ticket_end: string;
  is_fullbook: number;
  is_soldout: number;
  is_finish: number;
  is_ready: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  has_event: EventProps;
  max_buy_ticket?: number;
  event_schedule_date: string | null;
  available_seat_number?: string;
  seat_color?: string;
  ticket_category?: 'Seated' | 'Festival';
  has_ordered_seatnumber?: {
    seatnumber_ticket?: string;
  }[];
}

export type TicketPropsInputRequest = Pick<TicketProps, 'event_id' | 'name' | 'qty' | 'price' | 'description' | 'ticket_date' | 'ticket_end'>

export interface VacancyProps {
  id: number;
  vacancy_category_id: number;
  creator_id: number;
  event_id: number;
  name: string;
  slug: string;
  description: string;
  start_date: string;
  end_date: string;
  requirement_skill: string;
  min_salary: number;
  max_salary: number;
  status: string;
  location: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  has_category: CategoryProps;
  has_creator: CreatorProps;
  has_event: EventProps;
}

export interface MerchProps {
  id: number;
  creator_id: number;
  name: string;
  slug: string;
  sku: string;
  product_category_id: number;
  product_brand_id: number;
  barcode_id: number;
  unit_id: number;
  buying_price: string;
  selling_price: string;
  variation_price: string;
  status: number;
  order: number;
  can_purchasable: number;
  show_stock_out: number;
  maximum_purchase_quantity: number;
  low_stock_quantity_warning: number;
  weight: string;
  refundable: number;
  description: string;
  shipping_and_return: string;
  add_to_flash_sale: number;
  discount: string;
  offer_start_date: string;
  offer_end_date: string;
  is_product_quantity_multiply: number;
  editor_type: string;
  editor_id: number;
  created_by: string;
  updated_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryProps {
  id: number;
  name: string;
  description: string;
  image: string;
  thumbnail: string;
  is_favorite: number;
  status: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  image_url: string;
  thumbnail_url: string;
}

export interface CreatorProps {
  id: number;
  user_id: string;
  category_id: string;
  name: string;
  image: string;
  slug?: string;
  image_url?: string;
  description: null;
  longitude: string;
  latitude: string;
  website: string;
  status: 'active' | 'inactive';
  event_coordinator_name: string | null;
  event_cordinator_phone: string | null;
  created_by: string;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  verified: Date | null;
  email: string | null;
  phone_number: string | null;
  location: string | null;
}

export interface TransactionProps {
  date: string | number | Date;
  transaction_status_id: number;
  has_transaction_status: {
    id: number;
    name: string;
    description: string;
    bgcolor: string;
    created_by: null | number;
    updated_by: null | number;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
  };
  user_id: number;
  event_id: string;
  total_qty: number;
  total_price: number;
  payment_method: PaymentMethod;
  payment_status: string;
  updated_at: string;
  ppn: number;
  voucher_code: string;
  voucher_amount: number;
  invoice_no: string;
  admin_fee: number;
  created_at: string;
  grandtotal: number;
  id: number;
  xendit_url: string;
  has_user: UserProps;
  has_event: EventProps;
  identities: IdentityProps[];
  tickets: TransactionTicketProps[];
}

export interface PaymentMethod {
  id: number;
  payment_type_id: number;
  payment_name: string;
  account_no: string;
  account_name: string;
  account_branch: string;
  description: null;
  has_payment_link: PaymentLinks[];
  type: null;
  created_by: null;
  logo: string;
  updated_by: null;
  created_at: null;
  updated_at: null;
  deleted_at: null;
}

interface PaymentLinks {
  id: number;
  payment_method_id: number;
  group: string;
  description: string;
  has_payment_channel: PaymentChannel[];
  active: boolean;
  deleted_at: string;
}

interface PaymentChannel {
  id: number;
  payment_link_id: number;
  payment_method: string;
  payment_channel: string;
  type: string;
  fee: number;
  ppn: number;
  image: string | null;
  instruction: string | null;
  expired_time: number;
  active: string;
}

export type UserProps = Partial<{
  id: number;
  name: string | null;
  role_id: number;
  is_verified?: 0 | 1;
  email: string;
  email_verified_at: Date;
  otp_code: string | null;
  otp_expiry_time: Date;
  created_at: Date;
  updated_at: Date;
  has_creator?: CreatorProps;
  event_status_id: number;
  verified_status_id?: number;
  force_creator?: boolean;
  role?: "Staff" | "Creator" | "Pembeli" | 'Admin';
  bookmarked?: {
    id: number;
    user_id: number;
    module_id: number;
    type: string;
    event_id?: number;
    product_id?: number;
    lowongan_id?: number;
    talenta_id?: number;
  }[]
}>

export interface SliderProps {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  created_by: string;
  updated_by: Date | null;
  created_at: Date | null;
  updated_at: Date | null;
  deleted_at: null;
  image: string;
  image_url: string;
  link?: string;
}

export interface InboxListProps {
  lastMsg: string;
  id: number;
  from: UserProps;
  to: UserProps;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  chats: ChatProps[];
  has_replies?: any[];
  
  
}

export type GetCreatorResponse = CreatorProps & {
  has_user: UserProps;
}

interface ChatProps {
  id: number;
  inbox_id: number;
  message: string;
  status: "read" | "unread";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user_id: 5;
  user: UserProps;
}

export interface EventProps {
  id: number;
  creator_id: string;
  category_id: string;
  image_url: string | null;
  name: string;
  slug: string;
  image: string | null;
  image_thumbnail: string | null;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  zone_time: string;
  location_name: string;
  location_city: string;
  location_address: string;
  location_map: string;
  activity_status: string;
  starting_price: number;
  admin_fee: number;
  ppn: number;
  max_buy_ticket: number;
  one_email_ticket: string;
  one_id_one_ticket: string;
  description: string;
  term_condition: string;
  save_as_draft: string;
  event_status_id : number;
  has_creator: CreatorProps;
  has_event_status: EventStatus;
  has_event_payment_method: EventPaymentMethod[];
  has_event_social_meida: EventSocmed;
  has_event_topic?: {
    name: string;
  };
  has_category_event?: {
    name: string;
  }
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  is_birthdate: 1 | 0;
  is_email: 1 | 0;
  is_gender: 1 | 0;
  is_name: 1 | 0;
  is_noidentity: 1 | 0;
  is_phone_number: 1 | 0;
  grand_total: number;
  transaction_saldo_by_event: {
      event_id: number;
      event_slug: string;
      creator_id: number;
      creator_name: string;
      total_saldo_event: string;
  }
  seatmap?: SeatmapData[];
}

interface EventSocmed {
  id: number;
  event_id: number;
  status: string;
  website: string;
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  ig_name: string;
  created_by: string;
  updated_by: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  deleted_at: Date | null;
}

interface EventStatus {
  id: number;
  name: string;
  description: string;
  created_by: string;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  status: string;
}

interface EventPaymentMethod {
  has_payment_link: boolean;
  id: number;
  event_id: number;
  payment_method_id: number;
  status: string;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  has_payment_method: PaymentMethod;
}

interface VenueCategory {
  id: number;
  name: string;
  description: string;
  status: string;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

interface VenueCapacity {
  id: number;
  name: string;
  capacity: number;
  description: string;
  status: string;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
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

export interface VenueProps {
  id: number;
  venue_category_id: number;
  venue_capacity_id: number;
  venue_facility_id: number[];
  name: string;
  slug: string;
  image: string;
  description: string;
  location: string;
  location_name?: string;
  location_detail?: string;
  opening_hour: string;
  starting_price: number;
  contact_person_name: string;
  contact_person_email: string;
  contact_person_phone: string;
  status: string;
  venue_schedule_id: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  image_url: string;
  has_venue_category: VenueCategory;
  has_venue_capacity: VenueCapacity;
  has_venue_schedule: VenueSchedule;
  venue_gallery: {
      image_url: string;
  }[];
}

export interface TalentProps {
  id: number;
  user_id: number;
  talent_category_id: number;
  talent_subcategory_id: number | null;
  verify_status_id: number | null;
  slug: string;
  name: string;
  email: string;
  phone: string;
  bio: string | null;
  description: string | null;
  expected_salary: number | null;
  salary_status: string;
  work_skill: string;
  image: string;
  location: string;
  is_verified: number;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  image_thumbnail: string | null;
  image_url: string;
  thumbnail_url: string;
  has_user: any | null;
  has_category: TalentCategory;
  has_sub_category: any | null;
  has_verify_status: any | null;
}

interface TalentCategory {
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

export interface TransactionTicketProps {
  id: number;
  transaction_id: string;
  event_id: string;
  event_ticket_id: string;
  price: number;
  subtotal_price: number;
  qty_ticket: number;
  payment_status: string;
  has_event_ticket: TicketProps;
  created_by: Date | null;
  updated_by: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  code: string;
}

interface IdentityProps {
  id: number;
  transaction_id: string;
  nik: string;
  full_name: string;
  email: string;
  no_telp: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  is_pemesan?: 1 | 0;
}
