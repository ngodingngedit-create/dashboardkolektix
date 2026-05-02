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

// --- Sub-components ---

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
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Icon icon="mdi:view-dashboard-outline" width={24} className="text-primary" />
                <h3 className="text-lg font-bold">Board & Issues</h3>
            </div>
            <Input
                label="Board Name"
                placeholder="e.g. Sprint 1"
                labelPlacement="outside"
                size="md"
                value={formData.board.name}
                onChange={(e) => setFormData({ ...formData, board: { ...formData.board, name: e.target.value } })}
                variant="bordered"
                className="max-w-md bg-white"
                isDisabled={readOnly}
            />

            <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[400px]">
                {formData.board.lists.map((list, listIdx) => (
                    <div key={listIdx} className="min-w-[300px] bg-slate-100/50 rounded-2xl p-3 border border-light-grey">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <input
                                className="bg-transparent font-bold text-slate-700 w-full focus:outline-none disabled:opacity-100"
                                value={list.name}
                                disabled={readOnly}
                                onChange={(e) => {
                                    const updated = [...formData.board.lists];
                                    updated[listIdx].name = e.target.value;
                                    setFormData({ ...formData, board: { ...formData.board, lists: updated } });
                                }}
                            />
                            {!readOnly && (
                                <Button isIconOnly size="sm" variant="light" color="danger" onClick={() => removeList(listIdx)}>
                                    <FontAwesomeIcon icon={faTrash} size="xs" />
                                </Button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {list.issues.map((issue, issueIdx) => (
                                <Card
                                    key={issueIdx}
                                    isPressable
                                    onPress={() => handleEditIssue(listIdx, issueIdx)}
                                    className="shadow-sm border border-light-grey hover:border-primary-300 transition-colors bg-white w-full"
                                    shadow="none"
                                >
                                    <CardBody className="p-3">
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <span className="font-semibold text-sm text-slate-700 text-left line-clamp-2">{issue.title || "Untitled Issue"}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {issue.labels.map((lKey, i) => {
                                                const label = formData.labels.find(l => l.key === lKey);
                                                return (
                                                    <Chip
                                                        key={i}
                                                        size="sm"
                                                        variant="flat"
                                                        style={{ backgroundColor: label ? `${label.color}20` : '#f1f5f9', color: label ? label.color : '#64748b' }}
                                                        className="text-[10px] h-4 px-1"
                                                    >
                                                        {label ? label.name : lKey}
                                                    </Chip>
                                                );
                                            })}
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <Chip
                                                size="sm"
                                                color={issue.priority === 'high' ? 'danger' : issue.priority === 'medium' ? 'warning' : 'success'}
                                                variant="flat"
                                                className="text-[9px] h-4 uppercase font-bold"
                                            >
                                                {issue.priority}
                                            </Chip>
                                            <div className="flex -space-x-1 items-center">
                                                {issue.assignees.map((id, i) => (
                                                    <Tooltip key={i} content={`Assignee ID: ${id}`}>
                                                        <div className="w-5 h-5 rounded-full bg-primary-100 border border-white text-[8px] flex items-center justify-center font-bold text-primary-600">
                                                            {id}
                                                        </div>
                                                    </Tooltip>
                                                ))}
                                                {issue.comments.length > 0 && (
                                                    <div className="ml-2 flex items-center gap-1 text-slate-400">
                                                        <Icon icon="mdi:comment-outline" width={12} />
                                                        <span className="text-[10px]">{issue.comments.length}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                            {!readOnly && (
                                <Button
                                    fullWidth
                                    variant="flat"
                                    size="sm"
                                    startContent={<FontAwesomeIcon icon={faPlus} />}
                                    onClick={() => addIssue(listIdx)}
                                    className="border-slate-300 text-slate-500 hover:bg-white border-2 border-dashed"
                                >
                                    Add Issue
                                </Button>
                            )}
                        </div>
                    </div>
                ))}

                {!readOnly && (
                    <Button
                        variant="flat"
                        color="primary"
                        className="min-w-[300px] h-12 rounded-2xl border-2 border-dashed border-primary-200 bg-white"
                        startContent={<FontAwesomeIcon icon={faPlus} />}
                        onClick={addList}
                    >
                        Add New Column
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
    const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');
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

    useEffect(() => {
        if (loggedUser && !selectedProject) {
            setFormData(prev => ({ ...prev, creator_id: loggedUser.has_creator?.id ?? 0 }));
        }
    }, [loggedUser, selectedProject]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res: any = await Get("projects", {});
            // Handle the paginated response structure: { success: true, data: { data: [...] } }
            if (res && res.success && res.data && Array.isArray(res.data.data)) {
                setProjects(res.data.data);
            } else if (Array.isArray(res)) {
                setProjects(res);
            } else if (res && Array.isArray(res.data)) {
                setProjects(res.data);
            } else {
                setProjects([]);
            }
        } catch (error) {
            console.error("Failed to fetch projects:", error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectDetail = async (slug_url: string) => {
        setLoading(true);
        try {
            const res: any = await Get(`projects/${slug_url}/full`, {});
            if (res && res.success && res.data) {
                const fullData = res.data;
                // Map full data to our formData structure
                const mappedData: Project = {
                    id: fullData.id,
                    slug_url: fullData.slug_url,
                    name: fullData.name,
                    description: fullData.description,
                    creator_id: fullData.creator_id,
                    members: fullData.members.map((m: any) => ({ user_id: m.user_id, role: m.role })),
                    labels: [], // Will populate from issues
                    board: {
                        name: fullData.boards[0]?.name || "Default Board",
                        lists: (fullData.boards[0]?.lists || []).map((l: any) => ({
                            name: l.name,
                            position: l.position,
                            issues: l.issues.map((i: any) => ({
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

                // Extract unique labels from all issues
                const allLabels: Label[] = [];
                const seenLabels = new Set();
                fullData.boards.forEach((b: any) => {
                    b.lists.forEach((l: any) => {
                        l.issues.forEach((i: any) => {
                            (i.labels || []).forEach((lbl: any) => {
                                if (!seenLabels.has(lbl.name)) {
                                    seenLabels.add(lbl.name);
                                    allLabels.push({
                                        key: lbl.name.toLowerCase().replace(/\s+/g, '-'),
                                        name: lbl.name,
                                        color: lbl.color || "#3B82F6"
                                    });
                                }
                            });
                        });
                    });
                });
                mappedData.labels = allLabels;

                setFormData(mappedData);
                setViewMode('FORM');
            }
        } catch (error) {
            console.error("Failed to fetch project detail:", error);
            toast.error("Failed to load project details");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
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

    const handleView = (project: Project) => {
        setIsReadOnly(true);
        setSelectedProject(project);
        if (project.slug_url) {
            fetchProjectDetail(project.slug_url);
        } else {
            setFormData({ ...project });
            setViewMode('FORM');
        }
    };

    const handleEdit = (project: Project) => {
        setIsReadOnly(false);
        setSelectedProject(project);
        if (project.slug_url) {
            fetchProjectDetail(project.slug_url);
        } else {
            setFormData({ ...project });
            setViewMode('FORM');
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this project?")) {
            try {
                await Delete(`projects/${id}`, {});
                toast.success("Project deleted successfully");
                fetchProjects();
            } catch (error) {
                toast.error("Failed to delete project");
            }
        }
    };

    const handleSubmit = async () => {
        try {
            if (selectedProject) {
                await Put(`projects/${selectedProject.id}`, formData);
                toast.success("Project updated successfully");
            } else {
                await Post("projects", formData);
                toast.success("Project created successfully");
            }
            setViewMode('LIST');
            fetchProjects();
        } catch (error) {
            toast.error("Failed to save project");
        }
    };

    // Table Sorting State
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "name",
        direction: "ascending",
    });

    const sortedItems = [...projects].sort((a, b) => {
        const first = a[sortDescriptor.column as keyof Project] as any;
        const second = b[sortDescriptor.column as keyof Project] as any;

        // Handle special cases for members_count and boards_count if they are not in Project type
        let aVal = first;
        let bVal = second;

        if (sortDescriptor.column === "team") aVal = (a as any).members_count || 0;
        if (sortDescriptor.column === "team") bVal = (b as any).members_count || 0;
        if (sortDescriptor.column === "boards") aVal = (a as any).boards_count || 0;
        if (sortDescriptor.column === "boards") bVal = (b as any).boards_count || 0;

        let cmp = (parseInt(aVal) || aVal) < (parseInt(bVal) || bVal) ? -1 : 1;

        if (sortDescriptor.direction === "descending") {
            cmp *= -1;
        }

        return cmp;
    });

    if (viewMode === 'FORM') {
        return (
            <div className="min-h-screen bg-[#F8F9FA] pb-24">
                {/* Header Section */}
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div className="flex items-center gap-6 mb-8">
                        <Button
                            isIconOnly
                            variant="flat"
                            onClick={() => setViewMode('LIST')}
                            className="bg-white shadow-sm border border-light-grey text-slate-600 rounded-xl"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                {isReadOnly ? "Detail Project" : selectedProject ? "Edit Project" : "Buat Project Baru"}
                            </h1>
                            <p className="text-slate-400 text-sm">
                                {isReadOnly ? "Informasi rincian project Anda" : "Lengkapi rincian di bawah ini"}
                            </p>
                        </div>
                    </div>

                    {/* Main Card Section */}
                    <Card className="border border-light-grey shadow-sm rounded-2xl overflow-visible mb-8" shadow="none">
                        <CardBody className="p-10">
                            <div className="grid grid-cols-2 gap-x-12 gap-y-8">
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
                                        inputWrapper: "h-12 border-light-grey hover:border-slate-300 focus-within:!border-primary transition-colors"
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
                                        inputWrapper: "h-12 border-light-grey hover:border-slate-300 focus-within:!border-primary transition-colors"
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
                                            inputWrapper: "border-light-grey hover:border-slate-300 focus-within:!border-primary transition-colors"
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
                                <BoardSection formData={formData} setFormData={setFormData} readOnly={isReadOnly} />
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Footer Bar */}
                {!isReadOnly && (
                    <div className="fixed bottom-0 left-0 md:left-[65px] hvr:md:left-[280px] right-0 bg-white border-t border-light-grey py-4 px-6 z-40 transition-all duration-300">
                        <div className="max-w-7xl mx-auto flex justify-end gap-4 items-center">
                            <Button
                                variant="light"
                                className="text-slate-400 font-semibold"
                                onClick={() => setViewMode('LIST')}
                            >
                                <Icon icon="mdi:close" className="mr-1" /> Batal
                            </Button>
                            <Button
                                color="primary"
                                onClick={handleSubmit}
                                className="bg-[#2463EB] font-bold px-10 h-11 rounded-xl shadow-lg shadow-blue-200"
                                startContent={<Icon icon="mdi:content-save" width={20} />}
                            >
                                Simpan
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-slate-800 pb-20">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto px-6 pt-10 pb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Manajemen Project</h1>
                    <p className="text-slate-500 mt-1">Kelola project dan issue tracking Anda</p>
                </div>
                <Button
                    color="primary"
                    startContent={<FontAwesomeIcon icon={faPlus} />}
                    onClick={handleOpenCreate}
                    className="bg-[#2463EB] font-bold px-6 h-11 rounded-xl shadow-lg shadow-blue-200"
                >
                    Buat Project Baru
                </Button>
            </div>

            <div className="max-w-7xl mx-auto px-6 space-y-6">
                {/* Filter Bar */}
                <Card className="border-none shadow-sm rounded-2xl">
                    <CardBody className="p-4 flex flex-row items-center gap-3">
                        <Input
                            placeholder="Cari project..."
                            startContent={<Icon icon="mdi:magnify" className="text-slate-400" />}
                            className="flex-1"
                            variant="bordered"
                            size="sm"
                        />
                        <div className="flex gap-2">
                            <Button isIconOnly color="primary" variant="flat" onClick={fetchProjects} className="bg-blue-50 text-blue-600">
                                <Icon icon="mdi:refresh" width={20} />
                            </Button>
                            <Button variant="flat" className="bg-slate-100 text-slate-500 font-semibold px-6">
                                Reset
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                {/* Table Section */}
                <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                    <Table
                        aria-label="Projects table"
                        shadow="none"
                        selectionMode="none"
                        sortDescriptor={sortDescriptor}
                        onSortChange={setSortDescriptor}
                        classNames={{
                            base: "overflow-auto",
                            table: "min-w-[800px]",
                            thead: "bg-[#f5f7fa]",
                            th: "bg-transparent text-[#777] font-bold text-[12px] uppercase tracking-wider py-4 px-6",
                            td: "py-4 px-6 last:border-0",
                            tr: "hover:bg-[#f8fafd] transition-colors"
                        }}
                    >
                        <TableHeader>
                            <TableColumn key="no" width={60} align="center">#</TableColumn>
                            <TableColumn key="name" allowsSorting>PROJECT NAME</TableColumn>
                            <TableColumn key="creator_id" allowsSorting>CREATOR ID</TableColumn>
                            <TableColumn key="team" allowsSorting>TEAM</TableColumn>
                            <TableColumn key="boards" allowsSorting>BOARDS</TableColumn>
                            <TableColumn key="status" align="center">STATUS</TableColumn>
                            <TableColumn align="center">AKSI</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent={loading ? "Synchronizing data..." : "No projects active at the moment"}>
                            {sortedItems.map((project, idx) => (
                                <TableRow key={project.id}>
                                    <TableCell className="font-bold text-slate-500">{idx + 1}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Icon icon="mdi:folder-outline" className="text-slate-400" width={16} />
                                            <span className="font-bold text-[#2463EB] cursor-pointer hover:underline" onClick={() => handleView(project)}>
                                                {project.name || "N/A"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-700">{project.creator_id || "-"}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Icon icon="mdi:account-group-outline" className="text-slate-400" width={16} />
                                            <span className="font-semibold text-slate-600">{(project as any).members_count || 0} Members</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="sm" variant="flat" color="secondary" className="bg-purple-50 text-purple-600 border-none font-bold">
                                            {(project as any).boards_count || 0} Boards
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="sm"
                                            className="bg-[#4ade80] text-white font-extrabold px-4 h-6 rounded-md text-[10px]"
                                        >
                                            AKTIF
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-1">
                                            <Tooltip content="View Detail">
                                                <Button isIconOnly size="sm" variant="light" onClick={() => handleView(project)} className="text-[#2463EB]">
                                                    <Icon icon="mdi:eye-outline" width={18} />
                                                </Button>
                                            </Tooltip>
                                            <Tooltip content="Edit">
                                                <Button isIconOnly size="sm" variant="light" onClick={() => handleEdit(project)} className="text-warning">
                                                    <Icon icon="mdi:pencil-outline" width={18} />
                                                </Button>
                                            </Tooltip>
                                            <Tooltip content="Delete">
                                                <Button isIconOnly size="sm" variant="light" onClick={() => handleDelete(project.id!)} className="text-danger">
                                                    <Icon icon="mdi:trash-can-outline" width={18} />
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
};

export default IssueManagement;
