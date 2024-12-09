import { toast } from "react-toastify";
import fetch from "./fetch";
import { BookmarkListResponse } from "@/types/bookmark";

export default async function bookmarked(type: string, userid: number | string) {
    if (type == 'Event') {
        var result: BookmarkListResponse | undefined = undefined;

        await fetch<any, BookmarkListResponse>({
            url: 'bookmark/showby/' + userid,
            method: 'GET',
            success: ({ data }) => {
                result = data;
            },
        });

        return result;
    }
}