import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import {
    Card, CardBody, Button, Input, Textarea,
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
    Tooltip, SortDescriptor
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faUsers, faTag } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import useLoggedUser from "@/utils/useLoggedUser";
import { Get, Post, Put, Delete } from "@/utils/REST";
import { Project, UserMember, Label, Issue } from "@/types/issuemanagement";
import axios from "axios";
import config from "@/Config";
import Cookies from "js-cookie";
import moment from "moment";

type UserOption = { user_id: number; name: string };

// --- Sub-components ---

const WorkspaceSidebar = ({ projects, selectedProject, onSelect }: any) => {
    return (
        <div className="w-[280px] bg-slate-50 text-slate-600 flex flex-col h-full border-r border-light-grey">
            <div className="p-4 border-b border-light-grey bg-white">
                <div className="flex items-center gap-2 px-2 py-1">
                    <Image src="/images/logo.png" alt="Kolektix Logo" width={32} height={32} className="object-contain" />
                    <span className="font-bold text-slate-900 tracking-tight">Kolektix Work</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-6">
                {/* Spaces Section */}
                <div className="px-4 space-y-1">
                    <p className="px-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Spaces</p>
                    {projects.map((p: any) => (
                        <div 
                            key={p.id}
                            onClick={() => onSelect(p)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${selectedProject?.id === p.id ? 'bg-blue-50 text-blue-600 shadow-sm border border-light-grey' : 'hover:bg-slate-200/50 text-slate-500'}`}
                        >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2463EB' }} />
                            <span className="text-sm font-medium truncate">{p.name}</span>
                        </div>
                    ))}
                </div>

                <div className="px-4 space-y-1 pt-4 border-t border-light-grey">
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-200/50 rounded-lg cursor-pointer">
                        <Icon icon="mdi:account-group-outline" width={18} />
                        <span className="text-sm font-medium">Teams</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const WorkspaceHeader = ({ project, onAddIssue, viewMode, onCancel, onSave }: any) => {
    return (
        <div className="px-6 py-4 space-y-4 bg-white border-b border-light-grey">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-full cursor-pointer select-none">
                    <Icon icon="mdi:cube-outline" className="text-blue-600" width={16} />
                    <span className="text-sm font-bold text-slate-700">Product Space</span>
                    <Icon icon="mdi:chevron-down" className="text-slate-400" width={16} />
                </div>

                <div className="relative flex-1 max-w-xl">
                    <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width={16} />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="w-full bg-slate-100 text-sm text-slate-600 rounded-full py-2 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                    />
                </div>

                <div className="flex items-center gap-4 ml-auto">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-slate-800">{project?.name || "New Task"}</span>
                            <span className="text-[11px] font-medium text-slate-400">{project?.members?.length || 0} Members Active</span>
                        </div>
                        <div className="flex items-center -space-x-1.5">
                            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white text-[10px] font-bold text-slate-600 flex items-center justify-center">JD</div>
                            <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white text-[10px] font-bold text-white flex items-center justify-center">EN</div>
                        </div>
                    </div>
                    <Icon icon="mdi:bell-outline" className="text-slate-400" width={20} />
                </div>
            </div>

            {viewMode !== 'FORM' && (
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="flat" className="bg-slate-100 text-slate-600 rounded-full h-8 px-3 font-bold border-none" startContent={<Icon icon="mdi:filter-variant" width={14} />}>
                            Filter
                        </Button>
                        <Button size="sm" variant="flat" className="bg-slate-100 text-slate-600 rounded-full h-8 px-3 font-bold border-none" startContent={<Icon icon="mdi:sort" width={14} />}>
                            Sort
                        </Button>
                        <Button size="sm" variant="flat" className="bg-slate-100 text-slate-600 rounded-full h-8 px-3 font-bold border-none" startContent={<Icon icon="mdi:account-multiple-outline" width={14} />}>
                            Assignee
                        </Button>
                    </div>
                    <Button
                        color="primary"
                        size="sm"
                        onClick={onAddIssue}
                        className="bg-blue-600 font-bold h-8 rounded-lg shadow-md shadow-blue-200"
                        startContent={<Icon icon="mdi:plus" width={16} />}
                    >
                        Create Issue
                    </Button>
                </div>
            )}
        </div>
    );
};

const MembersSection = ({ formData, setFormData, readOnly, users }: { formData: Project, setFormData: any, readOnly?: boolean, users: UserOption[] }) => {
    const [newMember, setNewMember] = useState({ user_id: "", role: "developer" });

    const addMember = () => {
        if (!newMember.user_id) return;
        setFormData({
            ...formData,
            members: [...formData.members, { user_id: parseInt(newMember.user_id), role: newMember.role }]
        });
        setNewMember({ user_id: "", role: "developer" });
    };

    const selectedUser = users.find(u => u.user_id === parseInt(newMember.user_id));

    const removeMember = (index: number) => {
        const updated = [...formData.members];
        updated.splice(index, 1);
        setFormData({ ...formData, members: updated });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faUsers} className="text-primary" />
                <h3 className="text-sm font-bold text-slate-800">Team Members</h3>
            </div>
            {!readOnly && (
                <div className="flex flex-wrap items-end gap-4 bg-slate-50 p-4 rounded-xl border border-light-grey shadow-sm">
                    <Dropdown>
                        <DropdownTrigger>
                            <Button variant="bordered" size="sm" className="min-w-[220px] bg-white justify-start">
                                {selectedUser ? `${selectedUser.name} (#${selectedUser.user_id})` : "Pilih user..."}
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="User selection"
                            className="max-h-72 overflow-y-auto"
                            onAction={(key) => setNewMember({ ...newMember, user_id: String(key) })}
                        >
                            {users.map((u) => (
                                <DropdownItem key={u.user_id} textValue={`${u.name} (#${u.user_id})`}>
                                    {u.name} <span className="text-slate-400 text-xs">#{u.user_id}</span>
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button variant="bordered" size="sm" className="capitalize min-w-[140px] bg-white">
                                Role: {newMember.role}
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Role selection"
                            onAction={(key) => setNewMember({ ...newMember, role: key as string })}
                        >
                            <DropdownItem key="owner">Owner</DropdownItem>
                            <DropdownItem key="developer">Developer</DropdownItem>
                            <DropdownItem key="tester">Tester</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <Button color="primary" size="sm" isIconOnly onClick={addMember} className="h-[32px] w-[32px]">
                        <FontAwesomeIcon icon={faPlus} />
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {formData.members.map((member, i) => (
                    <Card key={i} className="border border-light-grey shadow-sm" shadow="none">
                        <CardBody className="p-3 flex flex-row justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                    {member.user_id}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">{users.find(u => u.user_id === member.user_id)?.name || `User ${member.user_id}`}</span>
                                    <span className="text-[10px] uppercase tracking-wider text-primary font-bold">{member.role}</span>
                                </div>
                            </div>
                            {!readOnly && (
                                <Button isIconOnly size="sm" variant="light" color="danger" onClick={() => removeMember(i)}>
                                    <FontAwesomeIcon icon={faTrash} size="xs" />
                                </Button>
                            )}
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
};

const LabelsSection = ({ formData, setFormData, readOnly }: { formData: Project, setFormData: any, readOnly?: boolean }) => {
    const [newLabel, setNewLabel] = useState({ name: "", color: "#3B82F6" });

    const addLabel = () => {
        if (!newLabel.name) return;
        const key = newLabel.name.toLowerCase().replace(/\s+/g, '-');
        setFormData({
            ...formData,
            labels: [...formData.labels, { key, name: newLabel.name, color: newLabel.color }]
        });
        setNewLabel({ name: "", color: "#3B82F6" });
    };

    const removeLabel = (index: number) => {
        const updated = [...formData.labels];
        updated.splice(index, 1);
        setFormData({ ...formData, labels: updated });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faTag} className="text-primary" />
                <h3 className="text-sm font-bold text-slate-800">Project Labels</h3>
            </div>
            {!readOnly && (
                <div className="flex flex-wrap items-end gap-4 bg-slate-50 p-4 rounded-xl border border-light-grey shadow-sm">
                    <Input
                        label="Label Name"
                        placeholder="e.g. Frontend"
                        size="sm"
                        value={newLabel.name}
                        onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
                        className="flex-1 min-w-[200px]"
                        variant="bordered"
                    />
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-500 ml-1">Color</label>
                        <input
                            type="color"
                            className="h-10 w-16 p-0 border-2 border-light-grey rounded cursor-pointer"
                            value={newLabel.color}
                            onChange={(e) => setNewLabel({ ...newLabel, color: e.target.value })}
                        />
                    </div>
                    <Button color="primary" size="sm" isIconOnly onClick={addLabel} className="h-[32px] w-[32px]">
                        <FontAwesomeIcon icon={faPlus} />
                    </Button>
                </div>
            )}

            <div className="flex gap-2 flex-wrap">
                {formData.labels.map((label, i) => (
                    <Chip
                        key={i}
                        onClose={readOnly ? undefined : () => removeLabel(i)}
                        variant="flat"
                        style={{ backgroundColor: `${label.color}20`, color: label.color, borderColor: label.color }}
                        className="font-semibold border"
                    >
                        {label.name}
                    </Chip>
                ))}
            </div>
        </div>
    );
};

const IssueDetailsModal = ({ isOpen, onOpenChange, issue, projectLabels, projectMembers, onUpdate, onDelete, readOnly, users, loggedUserId }: {
    isOpen: boolean,
    onOpenChange: any,
    issue: Issue,
    projectLabels: Label[],
    projectMembers: UserMember[],
    onUpdate: (issue: Issue) => void,
    onDelete: () => void,
    readOnly?: boolean,
    users: UserOption[],
    loggedUserId?: number
}) => {
    const [data, setData] = useState<Issue>({ ...issue });
    const [newComment, setNewComment] = useState("");

    const handleSave = () => {
        onUpdate(data);
        onOpenChange();
    };

    const addComment = () => {
        if (!newComment) return;
        setData({
            ...data,
            comments: [...data.comments, { user_id: loggedUserId ?? 1, comment: newComment }]
        });
        setNewComment("");
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl" scrollBehavior="inside">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h3 className="text-lg font-bold">Issue Details</h3>
                        </ModalHeader>
                        <ModalBody className="gap-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-4">
                                    <Input
                                        label="Title"
                                        value={data.title}
                                        onChange={(e) => setData({ ...data, title: e.target.value })}
                                        variant="bordered"
                                        isDisabled={readOnly}
                                        classNames={{
                                            inputWrapper: "border-light-grey hover:border-slate-300 focus-within:!border-primary"
                                        }}
                                    />
                                    <Textarea
                                        label="Description"
                                        value={data.description}
                                        onChange={(e) => setData({ ...data, description: e.target.value })}
                                        variant="bordered"
                                        minRows={4}
                                        isDisabled={readOnly}
                                        classNames={{
                                            inputWrapper: "border-light-grey hover:border-slate-300 focus-within:!border-primary"
                                        }}
                                    />

                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold text-slate-600">Comments</h4>
                                        {!readOnly && (
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Add a comment..."
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    variant="flat"
                                                    size="sm"
                                                />
                                                <Button color="primary" size="sm" isIconOnly onClick={addComment}>
                                                    <Icon icon="mdi:send" />
                                                </Button>
                                            </div>
                                        )}
                                        <div className="space-y-3 mt-4">
                                            {data.comments.map((c, i) => (
                                                <div key={i} className="bg-slate-50 p-3 rounded-lg border border-light-grey flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary-600 flex-shrink-0">
                                                        {c.user_id}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-bold">{users.find(u => u.user_id === c.user_id)?.name || `User ${c.user_id}`}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-600">{c.comment}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 bg-slate-50 p-4 rounded-xl border border-light-grey">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</label>
                                        <div className="flex gap-1">
                                            {['low', 'medium', 'high'].map((p) => (
                                                <Button
                                                    key={p}
                                                    size="sm"
                                                    variant={data.priority === p ? "solid" : "flat"}
                                                    color={p === 'high' ? 'danger' : p === 'medium' ? 'warning' : 'success'}
                                                    onClick={readOnly ? undefined : () => setData({ ...data, priority: p as any })}
                                                    className="capitalize h-7 min-w-0 flex-1 px-0 text-[10px] font-bold"
                                                >
                                                    {p}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assignees</label>
                                        <div className="flex flex-wrap gap-2">
                                            {projectMembers.map((m) => (
                                                <Tooltip key={m.user_id} content={`User ID: ${m.user_id}`}>
                                                    <Chip
                                                        size="sm"
                                                        variant={data.assignees.includes(m.user_id) ? "solid" : "flat"}
                                                        color="primary"
                                                        onClick={readOnly ? undefined : () => {
                                                            const updated = data.assignees.includes(m.user_id)
                                                                ? data.assignees.filter(id => id !== m.user_id)
                                                                : [...data.assignees, m.user_id];
                                                            setData({ ...data, assignees: updated });
                                                        }}
                                                        className={readOnly ? "" : "cursor-pointer"}
                                                    >
                                                        {users.find(u => u.user_id === m.user_id)?.name || m.user_id}
                                                    </Chip>
                                                </Tooltip>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Labels</label>
                                        <div className="flex flex-wrap gap-1">
                                            {projectLabels.map((l) => (
                                                <Chip
                                                    key={l.key}
                                                    size="sm"
                                                    variant={data.labels.includes(l.key) ? "solid" : "flat"}
                                                    style={data.labels.includes(l.key) ? { backgroundColor: l.color } : { color: l.color, borderColor: l.color }}
                                                    onClick={readOnly ? undefined : () => {
                                                        const updated = data.labels.includes(l.key)
                                                            ? data.labels.filter(k => k !== l.key)
                                                            : [...data.labels, l.key];
                                                        setData({ ...data, labels: updated });
                                                    }}
                                                    className={readOnly ? "font-semibold" : "cursor-pointer font-semibold"}
                                                >
                                                    {l.name}
                                                </Chip>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter className="border-t border-light-grey bg-white/50 h-2" />
                    </>
                )}
            </ModalContent>

            {/* Global Sticky Footer for Modal Actions */}
            {isOpen && (
                <div 
                    className="fixed bottom-0 left-0 md:left-[65px] transition-all duration-300"
                    style={{
                        right: 0,
                        backgroundColor: 'white',
                        padding: '16px 40px',
                        borderTop: '1px solid #e9ecef',
                        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
                        zIndex: 10000, 
                    }}
                >
                    <div className="flex justify-between items-center px-10">
                        {!readOnly ? (
                            <>
                                <Button 
                                    variant="light" 
                                    color="danger" 
                                    onClick={() => { onDelete(); onOpenChange(false); }}
                                    startContent={<Icon icon="mdi:trash-can-outline" width={18} />}
                                    className="font-bold text-red-500"
                                >
                                    Hapus Task
                                </Button>
                                <div className="flex gap-4">
                                    <Button 
                                        variant="flat" 
                                        onPress={() => onOpenChange(false)}
                                        startContent={<Icon icon="mdi:close" width={18} />}
                                        className="font-bold text-slate-600 px-8 h-11"
                                    >
                                        Batal
                                    </Button>
                                    <Button 
                                        color="primary" 
                                        onClick={handleSave}
                                        startContent={<Icon icon="mdi:check" width={18} />}
                                        className="bg-[#194e9e] font-bold text-white shadow-lg shadow-blue-100 px-10 h-11"
                                    >
                                        Simpan Perubahan
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="w-full flex justify-end">
                                <Button 
                                    variant="flat" 
                                    onPress={() => onOpenChange(false)} 
                                    className="font-bold px-10 h-11"
                                    startContent={<Icon icon="mdi:close" width={18} />}
                                >
                                    Tutup
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Modal>
    );
};

const COLUMN_DOT: Record<string, string> = {
    "To Do": "bg-blue-400",
    "Todo": "bg-blue-400",
    "In Progress": "bg-blue-600",
    "Doing": "bg-blue-600",
    "Done": "bg-blue-800",
};

const EMPTY_CONTENT: Record<string, { title: string; desc: string; icon: string; showAdd: boolean }> = {
    "To Do": {
        title: "Plan Your Work",
        desc: "Break down your project into manageable tasks and start tracking progress.",
        icon: "mdi:clipboard-text-outline",
        showAdd: true,
    },
    "Todo": {
        title: "Plan Your Work",
        desc: "Break down your project into manageable tasks and start tracking progress.",
        icon: "mdi:clipboard-text-outline",
        showAdd: true,
    },
    "In Progress": {
        title: "Nothing Active",
        desc: "Drag tasks here when you start working on them to keep the team updated.",
        icon: "mdi:account-cog-outline",
        showAdd: false,
    },
    "Doing": {
        title: "Nothing Active",
        desc: "Drag tasks here when you start working on them to keep the team updated.",
        icon: "mdi:account-cog-outline",
        showAdd: false,
    },
    "Done": {
        title: "Clean Slate",
        desc: "Completed tasks will land here. Keep pushing forward!",
        icon: "mdi:check-decagram-outline",
        showAdd: false,
    },
};

const BoardSection = ({ formData, setFormData, readOnly, users, loggedUserId }: { formData: Project, setFormData: any, readOnly?: boolean, users: UserOption[], loggedUserId?: number }) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedIssue, setSelectedIssue] = useState<{ listIdx: number, issueIdx: number } | null>(null);

    const removeList = (index: number) => {
        const updatedLists = [...formData.board.lists];
        updatedLists.splice(index, 1);
        setFormData({
            ...formData,
            board: { ...formData.board, lists: updatedLists }
        });
    };

    const removeIssue = (listIndex: number, issueIndex: number) => {
        const updatedLists = [...formData.board.lists];
        updatedLists[listIndex].issues.splice(issueIndex, 1);
        setFormData({
            ...formData,
            board: { ...formData.board, lists: updatedLists }
        });
    };

    const addIssue = (listIndex: number) => {
        const newIssue: Issue = {
            title: "New Issue",
            description: "",
            priority: "medium",
            assignees: [],
            labels: [],
            comments: []
        };
        const updatedLists = [...formData.board.lists];
        updatedLists[listIndex].issues.push(newIssue);
        setFormData({
            ...formData,
            board: { ...formData.board, lists: updatedLists }
        });
    };

    const handleEditIssue = (listIdx: number, issueIdx: number) => {
        setSelectedIssue({ listIdx, issueIdx });
        onOpen();
    };

    return (
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50">
            <div className="flex gap-4 overflow-x-auto p-6 items-start h-full no-scrollbar">
                {formData.board.lists.map((list, listIdx) => {
                    const content = EMPTY_CONTENT[list.name] || { title: "Nothing here yet", desc: "No tasks yet", icon: "mdi:clipboard-text-outline", showAdd: false };
                    return (
                    <div key={listIdx} className="min-w-[320px] max-w-[320px] flex flex-col max-h-full bg-slate-100/70 rounded-2xl p-3">
                        <div className="flex justify-between items-center mb-3 px-1">
                            <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${COLUMN_DOT[list.name] || 'bg-slate-400'}`} />
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{list.name}</span>
                                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">{list.issues.length}</span>
                            </div>
                            {!readOnly && (
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button isIconOnly size="sm" variant="light" className="text-slate-400 hover:text-slate-600">
                                            <Icon icon="mdi:dots-horizontal" width={18} />
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu onAction={(key) => key === 'delete' && removeList(listIdx)}>
                                        <DropdownItem key="delete" color="danger" className="text-danger">Delete Column</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            )}
                        </div>

                        <div className="space-y-3 overflow-y-auto pr-1 no-scrollbar pb-20">
                            {list.issues.length === 0 && (
                                <div className="bg-white rounded-xl border border-light-grey shadow-sm py-8 px-4 flex flex-col items-center gap-2 text-center">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Icon icon={content.icon} width={24} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-600">{content.title}</span>
                                    <span className="text-xs text-slate-400 leading-relaxed">{content.desc}</span>
                                    {content.showAdd && !readOnly && (
                                        <Button size="sm" variant="flat" className="mt-1 bg-blue-50 text-blue-600 font-bold rounded-full h-8 px-3 border-none" startContent={<Icon icon="mdi:plus" width={14} />}>
                                            Add First Task
                                        </Button>
                                    )}
                                </div>
                            )}
                            {list.issues.map((issue, issueIdx) => (
                                <Card
                                    key={issueIdx}
                                    isPressable
                                    onPress={() => handleEditIssue(listIdx, issueIdx)}
                                    className="shadow-sm border border-light-grey hover:border-slate-300 transition-all bg-white w-full group/card"
                                    shadow="none"
                                >
                                    <CardBody className="p-4 space-y-3">
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="font-bold text-sm text-slate-700 text-left line-clamp-2 leading-snug group-hover/card:text-blue-600 transition-colors">{issue.title || "Untitled Issue"}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-light-grey">
                                                <Icon icon="solar:calendar-linear" width={12} />
                                                <span>May 13, 2026</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-1">
                                            <div className="flex items-center gap-1.5">
                                                <Icon icon="mdi:bookmark" className="text-green-500" width={16} />
                                                <span className="text-[10px] font-black text-slate-400 tracking-tighter uppercase">SCRUM-{listIdx}{issueIdx}</span>
                                            </div>
                                            <div className="flex -space-x-1.5 items-center">
                                                {issue.assignees.length > 0 ? issue.assignees.map((id, i) => (
                                                    <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white text-[8px] flex items-center justify-center font-bold text-slate-700">
                                                        {id}
                                                    </div>
                                                )) : (
                                                    <div className="w-6 h-6 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-slate-300">
                                                        <Icon icon="mdi:account-outline" width={12} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {issue.labels.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {issue.labels.map((lKey, i) => {
                                                    const label = formData.labels.find(l => l.key === lKey);
                                                    return (
                                                        <div 
                                                            key={i}
                                                            className="h-1 rounded-full flex-1"
                                                            style={{ backgroundColor: label ? label.color : '#64748b' }}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            ))}
                            {!readOnly && (
                                <Button
                                    fullWidth
                                    variant="light"
                                    size="sm"
                                    startContent={<Icon icon="mdi:plus" width={18} />}
                                    onClick={() => addIssue(listIdx)}
                                    className="text-slate-400 hover:text-slate-600 font-bold justify-start px-2 h-10 hover:bg-slate-50 transition-colors"
                                >
                                    Create
                                </Button>
                            )}
                        </div>
                    </div>
                    );
                })}
            </div>

            {selectedIssue && (
                <IssueDetailsModal
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    issue={formData.board.lists[selectedIssue.listIdx].issues[selectedIssue.issueIdx]}
                    projectLabels={formData.labels}
                    projectMembers={formData.members}
                    readOnly={readOnly}
                    users={users}
                    loggedUserId={loggedUserId}
                    onUpdate={(updatedIssue) => {
                        if (readOnly) return;
                        const updatedLists = [...formData.board.lists];
                        updatedLists[selectedIssue.listIdx].issues[selectedIssue.issueIdx] = updatedIssue;
                        setFormData({ ...formData, board: { ...formData.board, lists: updatedLists } });
                    }}
                    onDelete={() => {
                        if (readOnly) return;
                        removeIssue(selectedIssue.listIdx, selectedIssue.issueIdx);
                        onOpenChange();
                    }}
                />
            )}
        </div>
    );
};

// --- Main Page Component ---

const ProjectFormSection = ({ formData, setFormData, isReadOnly, setViewMode, handleSubmit, users }: any) => {
    return (
        <div className="h-full flex flex-col bg-slate-50/50">
            <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-32">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Hero header */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-white to-white border border-light-grey p-6 md:p-8">
                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-100/50 rounded-full blur-2xl pointer-events-none" />
                        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 shrink-0">
                                <Icon icon="mdi:file-document-plus-outline" width={22} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    <span>Workspace</span>
                                    <Icon icon="mdi:chevron-right" width={12} />
                                    <span className="text-blue-600">New Task</span>
                                </div>
                                <h1 className="text-xl md:text-2xl font-black text-slate-800">Buat Task / Issue Baru</h1>
                                <p className="text-sm text-slate-500 mt-0.5">Lengkapi rincian di bawah, lalu simpan untuk membuat project workspace baru.</p>
                            </div>
                            <Chip variant="flat" className="bg-blue-50 text-blue-600 border border-blue-100 font-bold self-start md:self-auto">
                                Draft
                            </Chip>
                        </div>
                    </div>

                    {/* 01 Basic */}
                    <section>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0">01</div>
                            <div>
                                <h2 className="text-sm font-black text-slate-800">Informasi Dasar</h2>
                                <p className="text-xs text-slate-400">Nama dan deskripsi task baru Anda</p>
                            </div>
                        </div>
                        <Card className="border border-light-grey shadow-none rounded-2xl overflow-visible" shadow="none">
                            <CardBody className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
                                <div>
                                    <Input
                                        label="Task Name *"
                                        placeholder="e.g. Mobile Ticketing Platform"
                                        labelPlacement="outside"
                                        size="sm"
                                        value={formData.name || ""}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        variant="bordered"
                                        isDisabled={isReadOnly}
                                        startContent={<Icon icon="mdi:format-title" className="text-slate-400" width={16} />}
                                        classNames={{
                                            label: "text-slate-700 font-bold mb-2",
                                            inputWrapper: "border-light-grey hover:border-slate-300 focus-within:!border-primary transition-colors rounded-xl bg-white"
                                        }}
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1.5">Nama unik untuk task/project Anda.</p>
                                </div>
                                <div>
                                    <Textarea
                                        label="Description"
                                        placeholder="Describe the purpose of this task..."
                                        labelPlacement="outside"
                                        size="sm"
                                        minRows={1}
                                        value={formData.description || ""}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        variant="bordered"
                                        isDisabled={isReadOnly}
                                        classNames={{
                                            label: "text-slate-700 font-bold mb-2",
                                            inputWrapper: "border-light-grey hover:border-slate-300 focus-within:!border-primary transition-colors rounded-xl bg-white"
                                        }}
                                    />
                                </div>
                            </CardBody>
                        </Card>
                    </section>

                    {/* 02 Team & Labels */}
                    <section>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0">02</div>
                            <div>
                                <h2 className="text-sm font-black text-slate-800">Tim & Label</h2>
                                <p className="text-xs text-slate-400">Atur anggota dan label untuk kolaborasi</p>
                            </div>
                        </div>
                        <Card className="border border-light-grey shadow-none rounded-2xl overflow-visible" shadow="none">
                            <CardBody className="p-6 md:p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                                    <MembersSection formData={formData} setFormData={setFormData} readOnly={isReadOnly} users={users} />
                                    <LabelsSection formData={formData} setFormData={setFormData} readOnly={isReadOnly} />
                                </div>
                            </CardBody>
                        </Card>
                    </section>

                    {/* 03 Board Structure */}
                    <section>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0">03</div>
                            <div>
                                <h2 className="text-sm font-black text-slate-800">Struktur Board Awal</h2>
                                <p className="text-xs text-slate-400">{formData.board.name} — dibuat otomatis saat project tersimpan</p>
                            </div>
                        </div>
                        <Card className="border-2 border-dashed border-primary-light-200 shadow-none rounded-2xl overflow-visible" shadow="none">
                            <CardBody className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {formData.board.lists.map((l: any, i: number) => (
                                    <div key={i} className="rounded-xl border border-light-grey bg-slate-50/70 p-4 flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-white border border-light-grey flex items-center justify-center text-blue-600 shrink-0">
                                            <Icon icon="mdi:view-column-outline" width={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-700 truncate">{l.name}</p>
                                            <p className="text-[11px] text-slate-400">{l.issues.length} issue</p>
                                        </div>
                                    </div>
                                ))}
                            </CardBody>
                        </Card>
                    </section>
                </div>
            </div>

            {/* Sticky Footer */}
            {!isReadOnly && (
                <div className="bg-white border-t border-light-grey px-6 md:px-10 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                    <div className="max-w-5xl mx-auto flex justify-end gap-4">
                        <Button
                            variant="flat"
                            color="default"
                            radius="lg"
                            startContent={<Icon icon="mdi:close" width={18} />}
                            onClick={() => setViewMode('BOARD')}
                            className="px-8 font-bold text-slate-600 h-11"
                        >
                            Batal
                        </Button>
                        <Button
                            color="primary"
                            radius="lg"
                            startContent={<Icon icon="mdi:check" width={18} />}
                            onClick={handleSubmit}
                            className="bg-blue-600 px-10 font-bold text-white shadow-lg shadow-blue-100 h-11"
                        >
                            Simpan Task
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

const IssueManagement = () => {
    const router = useRouter();
    const loggedUser = useLoggedUser();
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<UserOption[]>([]);
    const [loading, setLoading] = useState(true);

    // View State
    const [viewMode, setViewMode] = useState<'BOARD' | 'FORM'>('BOARD');
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Form State
    const [formData, setFormData] = useState<Project>({
        name: "",
        description: "",
        creator_id: 0,
        members: [],
        labels: [],
        board: {
            name: "Default Board",
            lists: [
                { name: "To Do", position: 1, issues: [] },
                { name: "In Progress", position: 2, issues: [] },
                { name: "Done", position: 3, issues: [] }
            ]
        }
    });

    useEffect(() => {
        fetchProjects();
        fetchUsers();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const token = Cookies.get("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res: any = await axios.get(`${config.wsUrl}my-projects`, { headers });
            const responseData = res.data;
            
            let data = [];
            if (responseData && responseData.success) {
                if (responseData.data && Array.isArray(responseData.data.data)) data = responseData.data.data;
                else if (Array.isArray(responseData.data)) data = responseData.data;
                else if (Array.isArray(responseData)) data = responseData;
                
                setProjects(data);
                if (data.length > 0 && !selectedProject) {
                    handleSelectProject(data[0]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = Cookies.get("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res: any = await axios.get(`${config.wsUrl}creator`, { headers });
            let creators: any[] = [];
            const rd = res.data;
            if (Array.isArray(rd?.data?.data)) creators = rd.data.data;
            else if (Array.isArray(rd?.data)) creators = rd.data;
            else if (Array.isArray(rd)) creators = rd;

            const options: UserOption[] = creators
                .filter((c: any) => c?.has_user?.is_creator === 0)
                .map((c: any) => ({ user_id: c.has_user.id, name: c.has_user.name || `User ${c.has_user.id}` }));
            if (loggedUser?.id) {
                options.unshift({ user_id: loggedUser.id, name: loggedUser.name || `User ${loggedUser.id}` });
            }
            setUsers(options);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    const handleSelectProject = async (project: Project) => {
        setLoading(true);
        setSelectedProject(project);
        try {
            const token = Cookies.get("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res: any = await axios.get(`${config.wsUrl}projects/${project.slug_url}/full`, { headers });
            const responseData = res.data;
            if (responseData && responseData.success && responseData.data) {
                const fullData = responseData.data;
                const mappedData: Project = {
                    id: fullData.id,
                    slug_url: fullData.slug_url,
                    name: fullData.name,
                    description: fullData.description,
                    creator_id: fullData.creator_id,
                    members: fullData.members.map((m: any) => ({ user_id: m.user_id, role: m.role })),
                    labels: [],
                    board: {
                        name: fullData.boards[0]?.name || "Default Board",
                        lists: (fullData.boards[0]?.lists || []).map((l: any, lIdx: number) => ({
                            name: l.name,
                            position: l.position,
                            issues: l.issues.map((i: any, iIdx: number) => ({
                                title: i.title,
                                description: i.description,
                                priority: i.priority,
                                assignees: i.assignees || [],
                                labels: (i.labels || []).map((lbl: any) => lbl.name),
                                comments: (i.comments || []).map((c: any) => ({ user_id: c.user_id, comment: c.comment }))
                            }))
                        }))
                    }
                };
                setFormData(mappedData);
                setViewMode('BOARD');
            }
        } catch (error) {
            console.error("Failed to fetch project detail:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNewProject = () => {
        setIsReadOnly(false);
        setSelectedProject(null);
        setFormData({
            name: "",
            description: "",
            creator_id: loggedUser?.has_creator?.id ?? 0,
            members: [],
            labels: [],
            board: {
                name: "Sprint 1",
                lists: [
                    { name: "To Do", position: 1, issues: [] },
                    { name: "In Progress", position: 2, issues: [] },
                    { name: "Done", position: 3, issues: [] }
                ]
            }
        });
        setViewMode('FORM');
    };

    const handleSubmit = async () => {
        try {
            if (selectedProject?.id) {
                await Put(`projects/${selectedProject.id}`, formData);
                toast.success("Project updated successfully");
            } else {
                await Post("projects", formData);
                toast.success("Project created successfully");
            }
            fetchProjects();
        } catch (error) {
            toast.error("Failed to save project");
        }
    };

    return (
        <div className="fixed inset-0 top-[65px] left-0 md:left-[65px] hvr:md:left-[280px] bg-white flex transition-all duration-300 overflow-hidden">
            <WorkspaceSidebar 
                projects={projects} 
                selectedProject={selectedProject} 
                onSelect={handleSelectProject}
            />
            
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <WorkspaceHeader 
                    project={selectedProject || formData} 
                    onAddIssue={handleCreateNewProject} 
                    viewMode={viewMode}
                    onCancel={() => setViewMode('BOARD')}
                    onSave={handleSubmit}
                />
                
                <div className="flex-1 overflow-hidden flex flex-col">
                    {loading ? (
                         <div className="flex items-center justify-center h-full gap-3 text-slate-400">
                             <Icon icon="mdi:loading" className="animate-spin" width={24} />
                             <span className="font-bold">Syncing Workspace...</span>
                         </div>
                    ) : (
                        viewMode === 'FORM' ? (
                            <ProjectFormSection 
                                formData={formData} 
                                setFormData={setFormData} 
                                isReadOnly={isReadOnly} 
                                setViewMode={setViewMode}
                                handleSubmit={handleSubmit}
                                users={users}
                            />
                        ) : (
                            <BoardSection 
                                formData={formData} 
                                setFormData={setFormData} 
                                readOnly={isReadOnly} 
                                users={users}
                                loggedUserId={loggedUser?.id}
                            />
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default IssueManagement;
