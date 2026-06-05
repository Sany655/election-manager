"use strict";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";

const LocationAddModal = ({ isOpen, onClose, onSubmit, title, apiPath, token }) => {
    const [formData, setFormData] = useState({
        name: "",
        bn_name: "",
        pcode: "",
        division_id: "",
        district_id: "",
        upazilla_id: "",
        union_id: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    // State for dropdowns
    const [divisions, setDivisions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [upazillas, setUpazillas] = useState([]);
    const [unions, setUnions] = useState([]);

    // Fetch initial data based on what modal this is
    useEffect(() => {
        if (isOpen) {
            // Always fetch divisions if we might need them or their children
            fetchDivisions();
        }
    }, [isOpen]);

    // Fetch functions
    const fetchDivisions = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/divisions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDivisions(data.data || []);
            }
        } catch (e) { console.error(e); }
    };

    const fetchDistricts = async (divId) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/districts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) { // Simplified: fetching all for now, ideally filter by division in backend or frontend
                const data = await res.json();
                const filtered = (data.data || []).filter(d => d.division_id == divId);
                setDistricts(filtered);
            }
        } catch (e) { console.error(e); }
    };

    const fetchUpazillas = async (distId) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/upazillas`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const filtered = (data.data || []).filter(u => u.district_id == distId);
                setUpazillas(filtered);
            }
        } catch (e) { console.error(e); }
    };

    const fetchUnions = async (upzId) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/unions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const filtered = (data.data || []).filter(u => u.upazilla_id == upzId);
                setUnions(filtered);
            }
        } catch (e) { console.error(e); }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Cascading logic
        if (name === "division_id") {
            setDistricts([]); setUpazillas([]); setUnions([]);
            setFormData(prev => ({ ...prev, district_id: "", upazilla_id: "", union_id: "" }));
            fetchDistricts(value);
        } else if (name === "district_id") {
            setUpazillas([]); setUnions([]);
            setFormData(prev => ({ ...prev, upazilla_id: "", union_id: "" }));
            fetchUpazillas(value);
        } else if (name === "upazilla_id") {
            setUnions([]);
            setFormData(prev => ({ ...prev, union_id: "" }));
            fetchUnions(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Prepare payload based on title
        const payload = {
            name: formData.name,
            bn_name: formData.bn_name,
            pcode: formData.pcode
        };

        if (title === 'District') payload.division_id = formData.division_id;
        if (title === 'Upazilla' || title === 'Thana') payload.district_id = formData.district_id;
        if (title === 'Union') payload.upazilla_id = formData.upazilla_id;
        if (title === 'Ward') payload.union_id = formData.union_id;

        await onSubmit(payload);
        setIsLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New {title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 py-4">
                        {/* Dynamic Parent Selectors based on Type */}
                        {(title === 'District' || title === 'Upazilla' || title === 'Thana' || title === 'Union' || title === 'Ward') && (
                            <div className="flex flex-col gap-2">
                                <Label>Division</Label>
                                <Select value={formData.division_id} onValueChange={(val) => handleSelectChange("division_id", val)}>
                                    <SelectTrigger><SelectValue placeholder="Select Division" /></SelectTrigger>
                                    <SelectContent>
                                        {divisions.map((div) => <SelectItem key={div.id} value={div.id.toString()}>{div.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {(title === 'Upazilla' || title === 'Thana' || title === 'Union' || title === 'Ward') && (
                            <div className="flex flex-col gap-2">
                                <Label>District</Label>
                                <Select value={formData.district_id} onValueChange={(val) => handleSelectChange("district_id", val)} disabled={!formData.division_id}>
                                    <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                                    <SelectContent>
                                        {districts.map((dist) => <SelectItem key={dist.id} value={dist.id.toString()}>{dist.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {(title === 'Union' || title === 'Ward') && (
                            <div className="flex flex-col gap-2">
                                <Label>Upazilla/Thana</Label>
                                <Select value={formData.upazilla_id} onValueChange={(val) => handleSelectChange("upazilla_id", val)} disabled={!formData.district_id}>
                                    <SelectTrigger><SelectValue placeholder="Select Upazilla" /></SelectTrigger>
                                    <SelectContent>
                                        {upazillas.map((upz) => <SelectItem key={upz.id} value={upz.id.toString()}>{upz.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {(title === 'Ward') && (
                            <div className="flex flex-col gap-2">
                                <Label>Union</Label>
                                <Select value={formData.union_id} onValueChange={(val) => handleSelectChange("union_id", val)} disabled={!formData.upazilla_id}>
                                    <SelectTrigger><SelectValue placeholder="Select Union" /></SelectTrigger>
                                    <SelectContent>
                                        {unions.map((u) => <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}


                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="name">Name (English)</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Dhaka"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="bn_name">Name (Bangla)</Label>
                                <Input
                                    id="bn_name"
                                    name="bn_name"
                                    value={formData.bn_name}
                                    onChange={handleChange}
                                    placeholder="e.g. ঢাকা"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="pcode">PCode / Code</Label>
                            <Input
                                id="pcode"
                                name="pcode"
                                value={formData.pcode}
                                onChange={handleChange}
                                placeholder="Optional Code"
                            />
                        </div>

                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default LocationAddModal;
