export interface ModelTimestamp {
    created_at: string;
    updated_at?: string;
}

export interface ModelSoftDelete {
    deleted_at: string;
}

export type ModelDefault = {
    id: number;
} & ModelTimestamp

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationData {
    current_page?: number;
    first_page_url?: string;
    from?: number;
    last_page?: number;
    last_page_url?: string;
    links?: PaginationLink[];
    next_page_url?: string | null;
    path?: string;
    per_page?: number;
    prev_page_url?: string | null;
    to?: number;
    total?: number;
}

export type Pagination<T> = PaginationData & {
    data: T[];
};

export type RequestQuery = {
    page?: number;
    per_page?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    filters?: { [key: string]: string | number };
}
