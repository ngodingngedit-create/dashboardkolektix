export interface UserMember {
  user_id: number;
  role: string;
}

export interface Label {
  key: string;
  name: string;
  color: string;
}

export interface Comment {
  user_id: number;
  comment: string;
}

export interface Issue {
  id?: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignees: number[];
  labels: string[]; // array of label keys
  comments: Comment[];
}

export interface BoardList {
  name: string;
  position: number;
  issues: Issue[];
}

export interface Board {
  name: string;
  lists: BoardList[];
}

export interface Project {
  id?: number;
  slug_url?: string;
  name: string;
  description: string;
  creator_id: number;
  members: UserMember[];
  labels: Label[];
  board: Board;
}
