import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
    Card, CardBody, Button, Input, Textarea,
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
    Tooltip, Divider, SortDescriptor
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faEdit, faArrowLeft, faSave, faUsers, faTag, faClipboardList, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import useLoggedUser from "@/utils/useLoggedUser";
import { Get, Post, Put, Delete } from "@/utils/REST";
import { Project, UserMember, Label, Issue } from "@/types/issuemanagement";
import moment from "moment";

// --- Sub-components ---

const WorkspaceSidebar = ({ projects, selectedProject, onSelect }: any) => {
    return (
        <div className="w-[280px] bg-slate-50 text-slate-600 flex flex-col h-full border-r border-light-grey">
            <div className="p-4 border-b border-light-grey bg-white">
                <div className="flex items-center gap-2 px-2 py-1">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                        <Icon icon="mdi:view-grid-plus" className="text-white text-xl" />
                    </div>
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
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${selectedProject?.id === p.id ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'hover:bg-slate-200/50 text-slate-500'}`}
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
        <div className="px-6 pt-6 pb-2 space-y-4 bg-white border-b border-light-grey">
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Spaces</p>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Icon icon="mdi:cube-outline" className="text-blue-500" width={20} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{project?.name || "New Project"}</h2>
                        <div className="flex items-center gap-2 ml-2 px-2 py-1 bg-slate-100 rounded-md">
                             <Icon icon="mdi:account-group" className="text-slate-500" width={16} />
                             <span className="text-[10px] font-bold text-slate-600">{project?.members?.length || 0}</span>
                        </div>
                        <Icon icon="mdi:dots-horizontal" className="text-slate-400 cursor-pointer hover:text-slate-600" width={20} />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {viewMode === 'FORM' ? (
                        <div className="flex gap-2">
                             <Button 
                                variant="light" 
                                size="sm"
                                onClick={onCancel}
                                className="text-slate-400 font-bold h-9 rounded-lg"
                                startContent={<Icon icon="mdi:close" width={18} />}
                            >
                                Batal
                            </Button>
                            <Button 
                                color="primary" 
                                size="sm"
                                onClick={onSave}
                                className="bg-blue-600 font-bold h-9 rounded-lg shadow-md shadow-blue-200"
                                startContent={<Icon icon="mdi:content-save" width={18} />}
                            >
                                Simpan Project
                            </Button>
                        </div>
                    ) : (
                        <Button 
                            color="primary" 
                            size="sm"
                            onClick={onAddIssue}
                            className="bg-blue-600 font-bold h-9 rounded-lg shadow-md shadow-blue-200"
                            startContent={<Icon icon="mdi:plus" width={18} />}
                        >
                            Create
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-6 overflow-x-auto pb-px no-scrollbar">
                {['Board'].map((tab) => (
                    <div 
                        key={tab} 
                        className={`pb-3 text-sm font-bold cursor-pointer transition-all px-1 whitespace-nowrap ${tab === 'Board' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <div className="flex items-center gap-2">
                             {tab === 'Board' && <Icon icon="mdi:view-column-outline" width={16} />}
                             {tab}
                        </div>
                    </div>
                ))}
                <Icon icon="mdi:plus" className="text-slate-400 cursor-pointer mb-3" width={18} />
            </div>
            
            {viewMode !== 'FORM' && (
                <div className="flex items-center gap-4 py-2">
                    <div className="relative flex-1 max-w-md">
                        <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width={16} />
                        <input 
                            type="text" 
                            placeholder="Search board..." 
                            className="w-full bg-slate-50 text-sm text-slate-600 pl-10 pr-4 py-1.5 rounded-lg border border-light-grey focus:outline-none focus:border-blue-500/50 transition-all"
                        />
                    </div>
                    <div className="flex items-center -space-x-1">
                        <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white text-[10px] font-bold text-slate-600 flex items-center justify-center">JD</div>
                        <div className="w-7 h-7 rounded-full bg-blue-600 border-2 border-white text-[10px] font-bold text-white flex items-center justify-center">EN</div>
                    </div>
                    <Button variant="flat" size="sm" className="bg-white text-slate-600 font-bold h-8 border border-light-grey" startContent={<Icon icon="mdi:filter-variant" width={14} />}>
                        Filter
                    </Button>
                </div>
            )}
        </div>
    );
};

const MembersSection = ({ formData, setFormData, readOnly }: { formData: Project, setFormData: any, readOnly?: boolean }) => {
    const [newMember, setNewMember] = useState({ user_id: "", role: "developer" });

    const addMember = () => {
        if (!newMember.user_id) return;
        setFormData({
            ...formData,
            members: [...formData.members, { user_id: parseInt(newMember.user_id), role: newMember.role }]
        });
        setNewMember({ user_id: "", role: "developer" });
    };

    const removeMember = (index: number) => {
        const updated = [...formData.members];
        updated.splice(index, 1);
        setFormData({ ...formData, members: updated });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faUsers} className="text-primary" />
                <h3 className="text-lg font-bold">Team Members</h3>
            </div>
            {!readOnly && (
                <div className="flex gap-4 items-end bg-slate-50 p-4 rounded-xl border border-light-grey shadow-sm">
                    <Input
                        label="User ID"
                        placeholder="Enter ID"
                        size="sm"
                        value={newMember.user_id}
                        onChange={(e) => setNewMember({ ...newMember, user_id: e.target.value })}
                        className="max-w-[200px]"
                        variant="bordered"
                    />
                    <Dropdown>
                        <DropdownTrigger>
                            <Button variant="bordered" size="md" className="capitalize min-w-[150px] bg-white">
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
                    <Button color="primary" size="md" isIconOnly onClick={addMember} className="h-[40px] w-[40px]">
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
                                    <span className="text-sm font-semibold">User {member.user_id}</span>
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
                <h3 className="text-lg font-bold">Project Labels</h3>
            </div>
            {!readOnly && (
                <div className="flex gap-4 items-end bg-slate-50 p-4 rounded-xl border border-light-grey shadow-sm">
                    <Input
                        label="Label Name"
                        placeholder="e.g. Frontend"
                        size="sm"
                        value={newLabel.name}
                        onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
                        className="max-w-[200px]"
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
                    <Button color="primary" size="md" isIconOnly onClick={addLabel} className="h-[40px] w-[40px]">
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

const IssueDetailsModal = ({ isOpen, onOpenChange, issue, projectLabels, projectMembers, onUpdate, onDelete, readOnly }: {
    isOpen: boolean,
    onOpenChange: any,
    issue: Issue,
    projectLabels: Label[],
    projectMembers: UserMember[],
    onUpdate: (issue: Issue) => void,
    onDelete: () => void,
    readOnly?: boolean
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
            comments: [...data.comments, { user_id: 1, comment: newComment }]
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
                                                            <span className="text-xs font-bold">User {c.user_id}</span>
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
                                                        {m.user_id}
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
                        <ModalFooter className="justify-between">
                            {!readOnly ? (
                                <>
                                    <Button variant="light" color="danger" onClick={() => { onDelete(); onClose(); }}>
                                        <FontAwesomeIcon icon={faTrash} className="mr-2" />
                                        Delete Issue
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button variant="light" onPress={onClose}>Cancel</Button>
                                        <Button color="primary" onClick={handleSave}>Apply Changes</Button>
                                    </div>
                                </>
                            ) : (
                                <Button variant="light" onPress={onClose} className="w-full">Close</Button>
                            )}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

const BoardSection = ({ formData, setFormData, readOnly }: { formData: Project, setFormData: any, readOnly?: boolean }) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedIssue, setSelectedIssue] = useState<{ listIdx: number, issueIdx: number } | null>(null);

    const addList = () => {
        const newList = { name: "New Column", position: formData.board.lists.length + 1, issues: [] };
        setFormData({
            ...formData,
            board: { ...formData.board, lists: [...formData.board.lists, newList] }
        });
    };

    const removeList = (index: number) => {
        const updatedLists = [...formData.board.lists];
        updatedLists.splice(index, 1);
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

    const removeIssue = (listIndex: number, issueIndex: number) => {
        const updatedLists = [...formData.board.lists];
        updatedLists[listIndex].issues.splice(issueIndex, 1);
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
        <div className="flex-1 overflow-hidden flex flex-col bg-white">
            <div className="flex gap-4 overflow-x-auto p-6 items-start h-full no-scrollbar">
                {formData.board.lists.map((list, listIdx) => (
                    <div key={listIdx} className="min-w-[320px] max-w-[320px] flex flex-col max-h-full">
                        <div className="flex justify-between items-center mb-3 px-1">
                            <div className="flex items-center gap-2">
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
                ))}

                {!readOnly && (
                    <Button
                        variant="flat"
                        className="min-w-[320px] h-10 rounded-xl bg-slate-50 border border-dashed border-light-grey text-slate-400 hover:bg-slate-100 font-bold transition-colors"
                        startContent={<Icon icon="mdi:plus" width={18} />}
                        onClick={addList}
                    >
                        Add Column
                    </Button>
                )}
            </div>

            {selectedIssue && (
                <IssueDetailsModal
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    issue={formData.board.lists[selectedIssue.listIdx].issues[selectedIssue.issueIdx]}
                    projectLabels={formData.labels}
                    projectMembers={formData.members}
                    readOnly={readOnly}
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

const IssueManagement = () => {
    const router = useRouter();
    const loggedUser = useLoggedUser();
    const [projects, setProjects] = useState<Project[]>([]);
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
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res: any = await Get("projects", {});
            if (res && res.success && res.data && Array.isArray(res.data.data)) {
                const data = res.data.data;
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

    const handleSelectProject = async (project: Project) => {
        setLoading(true);
        setSelectedProject(project);
        try {
            const res: any = await Get(`projects/${project.slug_url}/full`, {});
            if (res && res.success && res.data) {
                const fullData = res.data;
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

    const ProjectFormSection = ({ formData, setFormData, isReadOnly }: any) => {
        return (
            <div className="flex-1 overflow-y-auto p-10 bg-white">
                <div className="max-w-4xl mx-auto space-y-10">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 mb-2">Project Details</h1>
                        <p className="text-slate-400 text-sm">Lengkapi rincian project Anda di bawah ini</p>
                    </div>

                    <Card className="border border-light-grey shadow-none rounded-2xl overflow-visible" shadow="none">
                        <CardBody className="p-8">
                            <div className="grid grid-cols-2 gap-x-10 gap-y-8">
                                <Input
                                    label="Project Name *"
                                    placeholder="e.g. Mobile Ticketing Platform"
                                    labelPlacement="outside"
                                    value={formData.name || ""}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    variant="bordered"
                                    className="bg-white"
                                    isDisabled={isReadOnly}
                                    classNames={{
                                        label: "text-slate-700 font-bold mb-2",
                                        inputWrapper: "h-12 border-light-grey hover:border-slate-300 focus-within:!border-primary transition-colors rounded-xl"
                                    }}
                                />
                                <Input
                                    label="Creator ID *"
                                    placeholder="ID"
                                    labelPlacement="outside"
                                    value={formData.creator_id?.toString() || ""}
                                    onChange={(e) => setFormData({ ...formData, creator_id: parseInt(e.target.value) || 0 })}
                                    variant="bordered"
                                    className="bg-white"
                                    isDisabled={isReadOnly}
                                    classNames={{
                                        label: "text-slate-700 font-bold mb-2",
                                        inputWrapper: "h-12 border-light-grey hover:border-slate-300 focus-within:!border-primary transition-colors rounded-xl"
                                    }}
                                />
                                <div className="col-span-2">
                                    <Textarea
                                        label="Description"
                                        placeholder="Describe the purpose of this project..."
                                        labelPlacement="outside"
                                        value={formData.description || ""}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        variant="bordered"
                                        className="bg-white"
                                        isDisabled={isReadOnly}
                                        classNames={{
                                            label: "text-slate-700 font-bold mb-2",
                                            inputWrapper: "border-light-grey hover:border-slate-300 focus-within:!border-primary transition-colors rounded-xl"
                                        }}
                                        minRows={3}
                                    />
                                </div>
                            </div>

                            <Divider className="my-10" />
                            <div className="grid grid-cols-1 gap-12">
                                <MembersSection formData={formData} setFormData={setFormData} readOnly={isReadOnly} />
                                <Divider />
                                <LabelsSection formData={formData} setFormData={setFormData} readOnly={isReadOnly} />
                                <Divider />
                                <div className="space-y-4">
                                     <h3 className="text-lg font-bold text-slate-800">Initial Board Structure</h3>
                                     <p className="text-xs text-slate-500">Board ini akan dibuat secara otomatis dengan kolom-kolom berikut</p>
                                     <div className="flex gap-2">
                                         {formData.board.lists.map((l: any, i: number) => (
                                             <Chip key={i} variant="flat" className="bg-slate-50 text-slate-600 border border-light-grey font-bold">{l.name}</Chip>
                                         ))}
                                     </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        );
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
                            />
                        ) : (
                            <BoardSection 
                                formData={formData} 
                                setFormData={setFormData} 
                                readOnly={isReadOnly} 
                            />
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default IssueManagement;
