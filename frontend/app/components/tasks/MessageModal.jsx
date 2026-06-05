import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have a Textarea component, or use native
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { useWhatsApp } from '@/app/context/whatsapp_context';

const MessageModal = ({ isOpen, onClose, task, onSubmit }) => {
    const [type, setType] = useState('sms');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState(task.title + '\n\n' + task.description);
    const { isReady } = useWhatsApp();
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!message) {
            toast.error("Message is required");
            return;
        }
        if (type === 'email' && !subject) {
            toast.error("Subject is required for emails");
            return;
        }
        if (type === 'whatsapp' && !isReady) {
            toast.error("Try again later, make sure to login to whatsapp!");
            return;
        }

        onSubmit({
            team_ids: task.volunteer_teams.map(t => t.id),
            message,
            subject,
            type
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-boxdark rounded-lg shadow-lg w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    ✕
                </button>

                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    Send Message to Team
                </h2>

                <div className="mb-4">
                    <p className="text-sm text-gray-500">
                        Sending to: {task.volunteer_teams.map(t => t.name).join(', ')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Message Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sms">SMS</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {type === 'email' && (
                        <div>
                            <Label>Subject</Label>
                            <Input
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Enter email subject"
                            />
                        </div>
                    )}

                    <div>
                        <Label>Message</Label>
                        <textarea
                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Send Message
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MessageModal;
