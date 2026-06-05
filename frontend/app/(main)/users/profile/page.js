"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FiEdit2, FiSave, FiX, FiUser, FiMail, FiPhone, FiArrowLeft,
  FiFileText, FiVideo, FiLink, FiTarget, FiAward, FiUsers, FiImage, FiPlus, FiTrash2,
  FiGlobe
} from 'react-icons/fi';
import {
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaTiktok
} from 'react-icons/fa';
import { useAuthContext } from '@/app/context/auth_context';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import DefaultLayout from '@/app/components/layout/DefaultLayout';
import { NextResponse } from 'next/server';

const ProfilePage = () => {
  const { user: authUser } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({});

  // Candidate data structure matching the unified JSON format
  const [userData, setUserData] = useState({
    userId: 1,

    personal: {
      firstName: '',
      lastName: '',
      navName: '',
      email: '',
      phone: '',
      gender: '',
      dateOfBirth: '',
      avatar: 'https://github.com/shadcn.png',
      password: '',
      confirmPassword: ''
    },

    slogans: {
      tagline: '',
      partySlogan: '',
      heroSlogan: ''
    },

    bio: {
      short: '',
      shortSegments: [],
      introduction: {
        title: 'Introduction',
        body: ''
      },
      biography: {
        title: 'Biography',
        body: ''
      },
      familyLegacy: {
        title: 'Family Legacy',
        items: [],
        summary: ''
      },
      aboutTitle: '',
      education: '',
      experience: '',
      achievements: ''
    },

    skills: {
      left: [],
      right: []
    },

    experience: {
      years: '0',
      label: 'Years of Service'
    },

    video: {
      title: '',
      description: '',
      url: '',
      thumbnail: ''
    },

    manifesto: {
      title: '',
      description: '',
      constituency: '',
      tagline: '',
      items: [],
      vision: {
        title: 'Our Vision',
        points: []
      },
      sections: [],
      commitment: '',
      status: 'draft',
      publishedDate: null
    },

    contact: {
      address: {
        line1: '',
        line2: ''
      },
      phone: '',
      email: ''
    },

    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: '',
      tiktok: '',
      website: ''
    },

    party: {
      name: '',
      abbreviation: '',
      description: ''
    },

    gallery: {
      images: []
    },

    poll: []
  });

  // Initialize with auth context data
  useEffect(() => {
    if (authUser) {
      // Helper to safely access nested properties
      const getPersonalDetail = (key) => authUser.personalDetails?.[key] || '';

      const initialData = {
        userId: authUser.id || 1,

        personal: {
          firstName: authUser.name ? authUser.name.split(' ')[0] : '',
          lastName: authUser.name ? authUser.name.split(' ').slice(1).join(' ') : '',
          navName: authUser.name || '',
          email: authUser.email || '',
          phone: authUser.msisdn || '',
          gender: authUser.gender || '',
          dateOfBirth: getPersonalDetail('dob') || authUser.joining_date || '', // Fallback to joining date if dob missing
          avatar: authUser.avatar || 'https://github.com/shadcn.png',
          password: '',
          confirmPassword: ''
        },

        // Map other fields that we might now have
        contact: {
          address: {
            line1: getPersonalDetail('present_address') || '',
            line2: getPersonalDetail('permanent_address') || ''
          },
          phone: getPersonalDetail('emergency_contact_phone') || '',
          email: authUser.email || ''
        },

        slogans: authUser.slogans || userData.slogans,
        bio: authUser.bio || userData.bio,
        skills: authUser.skills || userData.skills,
        experience: authUser.experience || userData.experience,
        video: authUser.video || userData.video,
        manifesto: authUser.manifesto || userData.manifesto,
        socialMedia: authUser.socialMedia || userData.socialMedia,
        party: authUser.party || userData.party,
        gallery: authUser.gallery || userData.gallery,
        poll: authUser.poll || []
      };

      setUserData(initialData);
      setFormData(initialData);
    }
  }, [authUser]);

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({ ...userData });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...userData });
  };

  const handleSave = async () => {
    try {
      if (formData.personal?.password && formData.personal.password !== formData.personal.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      // Create FormData object
      const payload = new FormData();

      // Append ID (required for the proxy/backend)
      payload.append('id', formData.userId);

      // Append flattened fields
      payload.append('name', `${formData.personal?.firstName || ''} ${formData.personal?.lastName || ''}`.trim());
      if (formData.personal?.email) payload.append('email', formData.personal.email);
      if (formData.personal?.phone) payload.append('msisdn', formData.personal.phone);
      if (formData.personal?.gender) payload.append('gender', formData.personal.gender);
      if (formData.personal?.dateOfBirth) payload.append('dob', formData.personal.dateOfBirth);

      // Address fields
      if (formData.contact?.address?.line1) payload.append('present_address', formData.contact.address.line1);
      if (formData.contact?.address?.line2) payload.append('permanent_address', formData.contact.address.line2);
      if (formData.contact?.phone) payload.append('emergency_contact_phone', formData.contact.phone);

      // Password (only if set)
      if (formData.personal?.password) {
        payload.append('password', formData.personal.password);
      }

      const response = await fetch('/frontapi/employee', { // Use shared proxy
        method: 'PATCH',
        // Content-Type header is not strictly needed for FormData as fetch sets it automatically with boundary, 
        // but explicitly *not* setting it to application/json is key.
        body: payload
      });

      const result = await response.json();

      if (response.ok) { // Check response.ok
        setUserData(formData);
        setIsEditing(false);
        alert('Profile saved successfully!');
        // Ideally trigger a refresh of auth context or user data here
        window.location.reload(); // Simple reload to refetch data
      } else {
        alert(result.msg || result.message || 'Failed to save');
        console.log({ success: false, error: result.msg || result.message || 'Failed to save' });
      }
    } catch (error) {
      console.log({ success: false, error: error.message });
      alert('An error occurred while saving.');
    }
  };

  // Handle nested input changes using dot notation
  const handleInputChange = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  // Handle array operations
  const addArrayItem = (path, defaultValue = '') => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      const arrayKey = keys[keys.length - 1];
      current[arrayKey] = [...(current[arrayKey] || []), defaultValue];
      return newData;
    });
  };

  const updateArrayItem = (path, index, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      const arrayKey = keys[keys.length - 1];
      current[arrayKey] = [...current[arrayKey]];
      current[arrayKey][index] = value;
      return newData;
    });
  };

  const removeArrayItem = (path, index) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      const arrayKey = keys[keys.length - 1];
      current[arrayKey] = current[arrayKey].filter((_, i) => i !== index);
      return newData;
    });
  };

  const getInitials = () => {
    const first = userData.personal?.firstName?.[0] || '';
    const last = userData.personal?.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  const socialMediaPlatforms = [
    { id: 'facebook', label: 'Facebook', icon: FaFacebook, color: 'text-blue-600' },
    { id: 'twitter', label: 'Twitter', icon: FaTwitter, color: 'text-sky-500' },
    { id: 'instagram', label: 'Instagram', icon: FaInstagram, color: 'text-pink-600' },
    { id: 'linkedin', label: 'LinkedIn', icon: FaLinkedin, color: 'text-blue-700' },
    { id: 'youtube', label: 'YouTube', icon: FaYoutube, color: 'text-red-600' },
    { id: 'tiktok', label: 'TikTok', icon: FaTiktok, color: 'text-gray-900' },
  ];

  return (
    <ProtectedRoute>
      <DefaultLayout title='Profile'>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6 group"
          >
            <FiArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>

          {/* Header Section */}
          {/* <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Candidate Profile</h1>
            <p className="text-muted-foreground">Manage your election campaign information</p>
          </div> */}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Avatar & Quick Info */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-32 w-32 mb-4 ring-4 ring-primary/10">
                      {/* <AvatarImage src={userData.personal?.avatar} alt={`${userData.personal?.firstName} ${userData.personal?.lastName}`} /> */}
                      <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>

                    <h2 className="text-2xl font-bold text-foreground mb-1">
                      {userData.personal?.firstName} {userData.personal?.lastName}
                    </h2>

                    <p className="text-sm text-muted-foreground mb-2">{userData.personal?.email}</p>

                    {userData.party?.name && (
                      <Badge variant="secondary" className="mb-4">
                        {userData.party.abbreviation || userData.party.name}
                      </Badge>
                    )}

                    {/* Edit/Save Buttons */}
                    {!isEditing ? (
                      <Button
                        onClick={handleEdit}
                        className="w-full"
                        variant="default"
                      >
                        <FiEdit2 className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2 w-full">
                        <Button
                          onClick={handleSave}
                          className="flex-1"
                          variant="default"
                        >
                          <FiSave className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                        <Button
                          onClick={handleCancel}
                          className="flex-1"
                          variant="outline"
                        >
                          <FiX className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Tabbed Content */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* <TabsList className="grid w-full grid-cols-7 mb-6">
                  <TabsTrigger value="personal" className="flex items-center gap-1">
                    <FiUser className="h-4 w-4" />
                    <span className="hidden sm:inline">Personal</span>
                  </TabsTrigger>

                  
                  <TabsTrigger value="slogans" className="flex items-center gap-1">
                    <FiTarget className="h-4 w-4" />
                    <span className="hidden sm:inline">Slogans</span>
                  </TabsTrigger>
                  <TabsTrigger value="bio" className="flex items-center gap-1">
                    <FiFileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Bio</span>
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="flex items-center gap-1">
                    <FiAward className="h-4 w-4" />
                    <span className="hidden sm:inline">Skills</span>
                  </TabsTrigger>
                  <TabsTrigger value="manifesto" className="flex items-center gap-1">
                    <FiFileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Manifesto</span>
                  </TabsTrigger>
                 

                  <TabsTrigger value="contact" className="flex items-center gap-1">
                    <FiLink className="h-4 w-4" />
                    <span className="hidden sm:inline">Contact</span>
                  </TabsTrigger>

                  
                  <TabsTrigger value="party" className="flex items-center gap-1">
                    <FiUsers className="h-4 w-4" />
                    <span className="hidden sm:inline">Party</span>
                  </TabsTrigger> 
                 
                </TabsList> */}

                {/* Personal Information Tab */}
                <TabsContent value="personal">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FiUser className="h-5 w-5" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>
                        {isEditing ? 'Update your personal details' : 'View your personal details'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          {isEditing ? (
                            <Input
                              id="firstName"
                              value={formData.personal?.firstName || ''}
                              onChange={(e) => handleInputChange('personal.firstName', e.target.value)}
                              placeholder="Enter first name"
                            />
                          ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                              {userData.personal?.firstName || <span className="text-muted-foreground italic">Not provided</span>}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          {isEditing ? (
                            <Input
                              id="lastName"
                              value={formData.personal?.lastName || ''}
                              onChange={(e) => handleInputChange('personal.lastName', e.target.value)}
                              placeholder="Enter last name"
                            />
                          ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                              {userData.personal?.lastName || <span className="text-muted-foreground italic">Not provided</span>}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="navName">Display Name</Label>
                          {isEditing ? (
                            <Input
                              id="navName"
                              value={formData.personal?.navName || ''}
                              onChange={(e) => handleInputChange('personal.navName', e.target.value)}
                              placeholder="Name shown in navigation"
                            />
                          ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                              {userData.personal?.navName || <span className="text-muted-foreground italic">Not provided</span>}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          {isEditing ? (
                            <Input
                              id="email"
                              type="email"
                              value={formData.personal?.email || ''}
                              onChange={(e) => handleInputChange('personal.email', e.target.value)}
                              placeholder="Enter email"
                            />
                          ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                              {userData.personal?.email || <span className="text-muted-foreground italic">Not provided</span>}
                            </div>
                          )}
                        </div>

                        {/* <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          {isEditing ? (
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.personal?.phone || ''}
                              onChange={(e) => handleInputChange('personal.phone', e.target.value)}
                              placeholder="+880 1711 000000"
                            />
                          ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                              {userData.personal?.phone || <span className="text-muted-foreground italic">Not provided</span>}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          {isEditing ? (
                            <select
                              id="gender"
                              value={formData.personal?.gender || ''}
                              onChange={(e) => handleInputChange('personal.gender', e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                              {userData.personal?.gender || <span className="text-muted-foreground italic">Not provided</span>}
                            </div>
                          )}
                        </div> */}

                        {/* <div className="space-y-2">
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          {isEditing ? (
                            <Input
                              id="dateOfBirth"
                              type="date"
                              value={formData.personal?.dateOfBirth || ''}
                              onChange={(e) => handleInputChange('personal.dateOfBirth', e.target.value)}
                            />
                          ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                              {userData.personal?.dateOfBirth ? new Date(userData.personal.dateOfBirth).toLocaleDateString() : <span className="text-muted-foreground italic">Not provided</span>}
                            </div>
                          )}
                        </div> */}

                        {/* <div className="space-y-2">
                          <Label htmlFor="avatar">Avatar URL</Label>
                          {isEditing ? (
                            <Input
                              id="avatar"
                              type="url"
                              value={formData.personal?.avatar || ''}
                              onChange={(e) => handleInputChange('personal.avatar', e.target.value)}
                              placeholder="https://example.com/avatar.jpg"
                            />
                          ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                              {userData.personal?.avatar || <span className="text-muted-foreground italic">Not provided</span>}
                            </div>
                          )}
                        </div> */}

                        {isEditing && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="password">New Password</Label>
                              <Input
                                id="password"
                                type="password"
                                value={formData.personal?.password || ''}
                                onChange={(e) => handleInputChange('personal.password', e.target.value)}
                                placeholder="Leave blank to keep current"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword">Confirm Password</Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.personal?.confirmPassword || ''}
                                onChange={(e) => handleInputChange('personal.confirmPassword', e.target.value)}
                                placeholder="Confirm new password"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Slogans Tab - COMMENTED OUT
                <TabsContent value="slogans">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FiTarget className="h-5 w-5" />
                        Campaign Slogans
                      </CardTitle>
                      <CardDescription>
                        Your campaign taglines and slogans
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="tagline">Campaign Tagline</Label>
                        {isEditing ? (
                          <Input
                            id="tagline"
                            value={formData.slogans?.tagline || ''}
                            onChange={(e) => handleInputChange('slogans.tagline', e.target.value)}
                            placeholder="e.g., For Change"
                          />
                        ) : (
                          <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                            {userData.slogans?.tagline || <span className="text-muted-foreground italic">Not provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="partySlogan">Party Slogan</Label>
                        {isEditing ? (
                          <Input
                            id="partySlogan"
                            value={formData.slogans?.partySlogan || ''}
                            onChange={(e) => handleInputChange('slogans.partySlogan', e.target.value)}
                            placeholder="e.g., Bangladesh Zindabad"
                          />
                        ) : (
                          <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                            {userData.slogans?.partySlogan || <span className="text-muted-foreground italic">Not provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="heroSlogan">Hero Slogan</Label>
                        {isEditing ? (
                          <Textarea
                            id="heroSlogan"
                            value={formData.slogans?.heroSlogan || ''}
                            onChange={(e) => handleInputChange('slogans.heroSlogan', e.target.value)}
                            placeholder="e.g., Your voice, your vote, your future."
                            rows={2}
                          />
                        ) : (
                          <div className="min-h-[60px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                            {userData.slogans?.heroSlogan || <span className="text-muted-foreground italic">Not provided</span>}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                */}

                {/* Bio Tab - COMMENTED OUT
                <TabsContent value="bio">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FiFileText className="h-5 w-5" />
                        Biography & Background
                      </CardTitle>
                      <CardDescription>
                        Your professional background and achievements
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="shortBio">Short Bio</Label>
                        {isEditing ? (
                          <Textarea
                            id="shortBio"
                            value={formData.bio?.short || ''}
                            onChange={(e) => handleInputChange('bio.short', e.target.value)}
                            placeholder="A brief introduction about yourself..."
                            rows={3}
                          />
                        ) : (
                          <div className="min-h-[80px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                            {userData.bio?.short || <span className="text-muted-foreground italic">No short bio provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="introBody">Introduction</Label>
                        {isEditing ? (
                          <Textarea
                            id="introBody"
                            value={formData.bio?.introduction?.body || ''}
                            onChange={(e) => handleInputChange('bio.introduction.body', e.target.value)}
                            placeholder="Your introduction..."
                            rows={4}
                          />
                        ) : (
                          <div className="min-h-[100px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                            {userData.bio?.introduction?.body || <span className="text-muted-foreground italic">No introduction provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bioBody">Full Biography</Label>
                        {isEditing ? (
                          <Textarea
                            id="bioBody"
                            value={formData.bio?.biography?.body || ''}
                            onChange={(e) => handleInputChange('bio.biography.body', e.target.value)}
                            placeholder="Your complete biography..."
                            rows={6}
                          />
                        ) : (
                          <div className="min-h-[150px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                            {userData.bio?.biography?.body || <span className="text-muted-foreground italic">No biography provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Family Legacy Items</Label>
                        {isEditing ? (
                          <div className="space-y-3">
                            {(formData.bio?.familyLegacy?.items || []).map((item, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  value={item}
                                  onChange={(e) => updateArrayItem('bio.familyLegacy.items', index, e.target.value)}
                                  placeholder="e.g., Grandfather: Name - Position"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removeArrayItem('bio.familyLegacy.items', index)}
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => addArrayItem('bio.familyLegacy.items', '')}
                              className="w-full"
                            >
                              <FiPlus className="h-4 w-4 mr-2" />
                              Add Legacy Item
                            </Button>
                          </div>
                        ) : (
                          <div className="min-h-[80px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                            {userData.bio?.familyLegacy?.items?.length > 0 ? (
                              <ul className="space-y-2">
                                {userData.bio.familyLegacy.items.map((item, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-muted-foreground italic">No legacy items added</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="legacySummary">Family Legacy Summary</Label>
                        {isEditing ? (
                          <Textarea
                            id="legacySummary"
                            value={formData.bio?.familyLegacy?.summary || ''}
                            onChange={(e) => handleInputChange('bio.familyLegacy.summary', e.target.value)}
                            placeholder="Summary of your family's legacy..."
                            rows={3}
                          />
                        ) : (
                          <div className="min-h-[80px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                            {userData.bio?.familyLegacy?.summary || <span className="text-muted-foreground italic">No summary provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="education">Education</Label>
                        {isEditing ? (
                          <Textarea
                            id="education"
                            value={formData.bio?.education || ''}
                            onChange={(e) => handleInputChange('bio.education', e.target.value)}
                            placeholder="Your educational background..."
                            rows={4}
                          />
                        ) : (
                          <div className="min-h-[100px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                            {userData.bio?.education || <span className="text-muted-foreground italic">No education information</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="experience">Professional Experience</Label>
                        {isEditing ? (
                          <Textarea
                            id="experience"
                            value={formData.bio?.experience || ''}
                            onChange={(e) => handleInputChange('bio.experience', e.target.value)}
                            placeholder="Your work experience..."
                            rows={4}
                          />
                        ) : (
                          <div className="min-h-[100px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                            {userData.bio?.experience || <span className="text-muted-foreground italic">No experience information</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="achievements">Key Achievements</Label>
                        {isEditing ? (
                          <Textarea
                            id="achievements"
                            value={formData.bio?.achievements || ''}
                            onChange={(e) => handleInputChange('bio.achievements', e.target.value)}
                            placeholder="Your achievements..."
                            rows={4}
                          />
                        ) : (
                          <div className="min-h-[100px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                            {userData.bio?.achievements || <span className="text-muted-foreground italic">No achievements listed</span>}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                */}

                {/* Skills Tab - COMMENTED OUT
                <TabsContent value="skills">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FiAward className="h-5 w-5" />
                        Skills & Expertise
                      </CardTitle>
                      <CardDescription>
                        Your key skills and competencies
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <Label>Left Column Skills</Label>
                          {isEditing ? (
                            <div className="space-y-3">
                              {(formData.skills?.left || []).map((skill, index) => (
                                <div key={index} className="flex gap-2">
                                  <Input
                                    value={skill}
                                    onChange={(e) => updateArrayItem('skills.left', index, e.target.value)}
                                    placeholder="e.g., Leadership"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeArrayItem('skills.left', index)}
                                  >
                                    <FiTrash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => addArrayItem('skills.left', '')}
                                className="w-full"
                              >
                                <FiPlus className="h-4 w-4 mr-2" />
                                Add Skill
                              </Button>
                            </div>
                          ) : (
                            <div className="min-h-[100px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                              {userData.skills?.left?.length > 0 ? (
                                <ul className="space-y-2">
                                  {userData.skills.left.map((skill, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="text-primary mt-1">•</span>
                                      <span>{skill}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-muted-foreground italic">No skills listed</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <Label>Right Column Skills</Label>
                          {isEditing ? (
                            <div className="space-y-3">
                              {(formData.skills?.right || []).map((skill, index) => (
                                <div key={index} className="flex gap-2">
                                  <Input
                                    value={skill}
                                    onChange={(e) => updateArrayItem('skills.right', index, e.target.value)}
                                    placeholder="e.g., Public Speaking"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeArrayItem('skills.right', index)}
                                  >
                                    <FiTrash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => addArrayItem('skills.right', '')}
                                className="w-full"
                              >
                                <FiPlus className="h-4 w-4 mr-2" />
                                Add Skill
                              </Button>
                            </div>
                          ) : (
                            <div className="min-h-[100px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                              {userData.skills?.right?.length > 0 ? (
                                <ul className="space-y-2">
                                  {userData.skills.right.map((skill, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="text-primary mt-1">•</span>
                                      <span>{skill}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-muted-foreground italic">No skills listed</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                */}

                {/* Manifesto Tab - COMMENTED OUT
                <TabsContent value="manifesto">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FiFileText className="h-5 w-5" />
                        Election Manifesto
                      </CardTitle>
                      <CardDescription>
                        Your vision and commitments
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="manifestoTitle">Manifesto Title</Label>
                        {isEditing ? (
                          <Input
                            id="manifestoTitle"
                            value={formData.manifesto?.title || ''}
                            onChange={(e) => handleInputChange('manifesto.title', e.target.value)}
                            placeholder="e.g., Vision 2024"
                          />
                        ) : (
                          <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                            {userData.manifesto?.title || <span className="text-muted-foreground italic">Not provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="manifestoDescription">Description</Label>
                        {isEditing ? (
                          <Textarea
                            id="manifestoDescription"
                            value={formData.manifesto?.description || ''}
                            onChange={(e) => handleInputChange('manifesto.description', e.target.value)}
                            placeholder="Manifesto overview..."
                            rows={3}
                          />
                        ) : (
                          <div className="min-h-[80px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                            {userData.manifesto?.description || <span className="text-muted-foreground italic">No description provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Vision Points</Label>
                        {isEditing ? (
                          <div className="space-y-3">
                            {(formData.manifesto?.vision?.points || []).map((point, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  value={point}
                                  onChange={(e) => updateArrayItem('manifesto.vision.points', index, e.target.value)}
                                  placeholder="e.g., Economic growth through innovation"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removeArrayItem('manifesto.vision.points', index)}
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => addArrayItem('manifesto.vision.points', '')}
                              className="w-full"
                            >
                              <FiPlus className="h-4 w-4 mr-2" />
                              Add Vision Point
                            </Button>
                          </div>
                        ) : (
                          <div className="min-h-[100px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                            {userData.manifesto?.vision?.points?.length > 0 ? (
                              <ul className="space-y-2">
                                {userData.manifesto.vision.points.map((point, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-muted-foreground italic">No vision points listed</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="commitment">Commitment Statement</Label>
                        {isEditing ? (
                          <Textarea
                            id="commitment"
                            value={formData.manifesto?.commitment || ''}
                            onChange={(e) => handleInputChange('manifesto.commitment', e.target.value)}
                            placeholder="Your commitment to the voters..."
                            rows={4}
                          />
                        ) : (
                          <div className="min-h-[100px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                            {userData.manifesto?.commitment || <span className="text-muted-foreground italic">No commitment statement provided</span>}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                */}

                {/* Slogans Tab */}
                {/* <TabsContent value="slogans">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FiTarget className="h-5 w-5" />
                        Campaign Slogans
                      </CardTitle>
                      <CardDescription>
                        Your campaign taglines and slogans
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="tagline">Campaign Tagline</Label>
                        {isEditing ? (
                          <Input
                            id="tagline"
                            value={formData.slogans?.tagline || ''}
                            onChange={(e) => handleInputChange('slogans.tagline', e.target.value)}
                            placeholder="e.g., For Change"
                          />
                        ) : (
                          <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                            {userData.slogans?.tagline || <span className="text-muted-foreground italic">Not provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="partySlogan">Party Slogan</Label>
                        {isEditing ? (
                          <Input
                            id="partySlogan"
                            value={formData.slogans?.partySlogan || ''}
                            onChange={(e) => handleInputChange('slogans.partySlogan', e.target.value)}
                            placeholder="e.g., Bangladesh Zindabad"
                          />
                        ) : (
                          <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                            {userData.slogans?.partySlogan || <span className="text-muted-foreground italic">Not provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="heroSlogan">Hero Slogan</Label>
                        {isEditing ? (
                          <Textarea
                            id="heroSlogan"
                            value={formData.slogans?.heroSlogan || ''}
                            onChange={(e) => handleInputChange('slogans.heroSlogan', e.target.value)}
                            placeholder="e.g., Your voice, your vote, your future."
                            rows={2}
                          />
                        ) : (
                          <div className="min-h-[60px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                            {userData.slogans?.heroSlogan || <span className="text-muted-foreground italic">Not provided</span>}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent> */}

                {/* Bio Tab */}
                {/* <TabsContent value="bio">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FiFileText className="h-5 w-5" />
                        Biography & Background
                      </CardTitle>
                      <CardDescription>
                        Your professional background and achievements
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="shortBio">Short Bio</Label>
                        {isEditing ? (
                          <Textarea
                            id="shortBio"
                            value={formData.bio?.short || ''}
                            onChange={(e) => handleInputChange('bio.short', e.target.value)}
                            placeholder="A brief introduction about yourself..."
                            rows={3}
                          />
                        ) : (
                          <div className="min-h-[80px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                            {userData.bio?.short || <span className="text-muted-foreground italic">No short bio provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="introBody">Introduction</Label>
                        {isEditing ? (
                          <Textarea
                            id="introBody"
                            value={formData.bio?.introduction?.body || ''}
                            onChange={(e) => handleInputChange('bio.introduction.body', e.target.value)}
                            placeholder="Your introduction..."
                            rows={4}
                          />
                        ) : (
                          <div className="min-h-[100px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                            {userData.bio?.introduction?.body || <span className="text-muted-foreground italic">No introduction provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bioBody">Full Biography</Label>
                        {isEditing ? (
                          <Textarea
                            id="bioBody"
                            value={formData.bio?.biography?.body || ''}
                            onChange={(e) => handleInputChange('bio.biography.body', e.target.value)}
                            placeholder="Your complete biography..."
                            rows={6}
                          />
                        ) : (
                          <div className="min-h-[150px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                            {userData.bio?.biography?.body || <span className="text-muted-foreground italic">No biography provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Family Legacy Items</Label>
                        {isEditing ? (
                          <div className="space-y-3">
                            {(formData.bio?.familyLegacy?.items || []).map((item, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  value={item}
                                  onChange={(e) => updateArrayItem('bio.familyLegacy.items', index, e.target.value)}
                                  placeholder="e.g., Grandfather: Name - Position"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removeArrayItem('bio.familyLegacy.items', index)}
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => addArrayItem('bio.familyLegacy.items', '')}
                              className="w-full"
                            >
                              <FiPlus className="h-4 w-4 mr-2" />
                              Add Legacy Item
                            </Button>
                          </div>
                        ) : (
                          <div className="min-h-[80px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                            {userData.bio?.familyLegacy?.items?.length > 0 ? (
                              <ul className="space-y-2">
                                {userData.bio.familyLegacy.items.map((item, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-muted-foreground italic">No legacy items added</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="legacySummary">Family Legacy Summary</Label>
                        {isEditing ? (
                          <Textarea
                            id="legacySummary"
                            value={formData.bio?.familyLegacy?.summary || ''}
                            onChange={(e) => handleInputChange('bio.familyLegacy.summary', e.target.value)}
                            placeholder="Summary of your family's legacy..."
                            rows={3}
                          />
                        ) : (
                          <div className="min-h-[80px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                            {userData.bio?.familyLegacy?.summary || <span className="text-muted-foreground italic">No summary provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="education">Education</Label>
                        {isEditing ? (
                          <Textarea
                            id="education"
                            value={formData.bio?.education || ''}
                            onChange={(e) => handleInputChange('bio.education', e.target.value)}
                            placeholder="Your educational background..."
                            rows={4}
                          />
                        ) : (
                          <div className="min-h-[100px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                            {userData.bio?.education || <span className="text-muted-foreground italic">No education information</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="experience">Professional Experience</Label>
                        {isEditing ? (
                          <Textarea
                            id="experience"
                            value={formData.bio?.experience || ''}
                            onChange={(e) => handleInputChange('bio.experience', e.target.value)}
                            placeholder="Your work experience..."
                            rows={4}
                          />
                        ) : (
                          <div className="min-h-[100px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                            {userData.bio?.experience || <span className="text-muted-foreground italic">No experience information</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="achievements">Key Achievements</Label>
                        {isEditing ? (
                          <Textarea
                            id="achievements"
                            value={formData.bio?.achievements || ''}
                            onChange={(e) => handleInputChange('bio.achievements', e.target.value)}
                            placeholder="Your achievements..."
                            rows={4}
                          />
                        ) : (
                          <div className="min-h-[100px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                            {userData.bio?.achievements || <span className="text-muted-foreground italic">No achievements listed</span>}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent> */}

                {/* Skills Tab */}
                {/* <TabsContent value="skills">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FiAward className="h-5 w-5" />
                        Skills & Expertise
                      </CardTitle>
                      <CardDescription>
                        Your professional skills and areas of expertise
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Left Column Skills</Label>
                          {isEditing ? (
                            <div className="space-y-3">
                              {(formData.skills?.left || []).map((skill, index) => (
                                <div key={index} className="flex gap-2">
                                  <Input
                                    value={skill}
                                    onChange={(e) => updateArrayItem('skills.left', index, e.target.value)}
                                    placeholder="e.g., Policy & Governance"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeArrayItem('skills.left', index)}
                                  >
                                    <FiTrash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => addArrayItem('skills.left', '')}
                                className="w-full"
                              >
                                <FiPlus className="h-4 w-4 mr-2" />
                                Add Skill
                              </Button>
                            </div>
                          ) : (
                            <div className="min-h-[100px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                              {userData.skills?.left?.length > 0 ? (
                                <ul className="space-y-2">
                                  {userData.skills.left.map((skill, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="text-primary mt-1">•</span>
                                      <span>{skill}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-muted-foreground italic">No skills added</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Right Column Skills</Label>
                          {isEditing ? (
                            <div className="space-y-3">
                              {(formData.skills?.right || []).map((skill, index) => (
                                <div key={index} className="flex gap-2">
                                  <Input
                                    value={skill}
                                    onChange={(e) => updateArrayItem('skills.right', index, e.target.value)}
                                    placeholder="e.g., Strategic Communication"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeArrayItem('skills.right', index)}
                                  >
                                    <FiTrash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => addArrayItem('skills.right', '')}
                                className="w-full"
                              >
                                <FiPlus className="h-4 w-4 mr-2" />
                                Add Skill
                              </Button>
                            </div>
                          ) : (
                            <div className="min-h-[100px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                              {userData.skills?.right?.length > 0 ? (
                                <ul className="space-y-2">
                                  {userData.skills.right.map((skill, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="text-primary mt-1">•</span>
                                      <span>{skill}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-muted-foreground italic">No skills added</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                        <div className="space-y-2">
                          <Label htmlFor="experienceYears">Years of Experience</Label>
                          {isEditing ? (
                            <Input
                              id="experienceYears"
                              value={formData.experience?.years || ''}
                              onChange={(e) => handleInputChange('experience.years', e.target.value)}
                              placeholder="e.g., 15+"
                            />
                          ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                              {userData.experience?.years || <span className="text-muted-foreground italic">Not provided</span>}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="experienceLabel">Experience Label</Label>
                          {isEditing ? (
                            <Input
                              id="experienceLabel"
                              value={formData.experience?.label || ''}
                              onChange={(e) => handleInputChange('experience.label', e.target.value)}
                              placeholder="e.g., Years of Service"
                            />
                          ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                              {userData.experience?.label || <span className="text-muted-foreground italic">Not provided</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="videoUrl">Campaign Video URL</Label>
                        {isEditing ? (
                          <Input
                            id="videoUrl"
                            type="url"
                            value={formData.video?.url || ''}
                            onChange={(e) => handleInputChange('video.url', e.target.value)}
                            placeholder="https://www.youtube.com/embed/..."
                          />
                        ) : (
                          <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                            {userData.video?.url || <span className="text-muted-foreground italic">Not provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="videoTitle">Video Title</Label>
                        {isEditing ? (
                          <Input
                            id="videoTitle"
                            value={formData.video?.title || ''}
                            onChange={(e) => handleInputChange('video.title', e.target.value)}
                            placeholder="e.g., A Message from..."
                          />
                        ) : (
                          <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                            {userData.video?.title || <span className="text-muted-foreground italic">Not provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="videoDescription">Video Description</Label>
                        {isEditing ? (
                          <Textarea
                            id="videoDescription"
                            value={formData.video?.description || ''}
                            onChange={(e) => handleInputChange('video.description', e.target.value)}
                            placeholder="Description of your campaign video..."
                            rows={2}
                          />
                        ) : (
                          <div className="min-h-[60px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                            {userData.video?.description || <span className="text-muted-foreground italic">Not provided</span>}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent> */}

                {/* Manifesto Tab */}
                {/* <TabsContent value="manifesto">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FiFileText className="h-5 w-5" />
                        Campaign Manifesto
                      </CardTitle>
                      <CardDescription>
                        Your vision, policies, and campaign promises
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="manifestoTitle">Manifesto Title</Label>
                        {isEditing ? (
                          <Input
                            id="manifestoTitle"
                            value={formData.manifesto?.title || ''}
                            onChange={(e) => handleInputChange('manifesto.title', e.target.value)}
                            placeholder="e.g., A Vision for Progress"
                          />
                        ) : (
                          <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center font-semibold">
                            {userData.manifesto?.title || <span className="text-muted-foreground italic font-normal">Not provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="manifestoDescription">Description</Label>
                        {isEditing ? (
                          <Textarea
                            id="manifestoDescription"
                            value={formData.manifesto?.description || ''}
                            onChange={(e) => handleInputChange('manifesto.description', e.target.value)}
                            placeholder="Brief description of your manifesto..."
                            rows={4}
                          />
                        ) : (
                          <div className="min-h-[100px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                            {userData.manifesto?.description || <span className="text-muted-foreground italic">Not provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="constituency">Constituency</Label>
                          {isEditing ? (
                            <Input
                              id="constituency"
                              value={formData.manifesto?.constituency || ''}
                              onChange={(e) => handleInputChange('manifesto.constituency', e.target.value)}
                              placeholder="e.g., Chattogram-7, Rangunia"
                            />
                          ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                              {userData.manifesto?.constituency || <span className="text-muted-foreground italic">Not provided</span>}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="manifestoTagline">Tagline</Label>
                          {isEditing ? (
                            <Input
                              id="manifestoTagline"
                              value={formData.manifesto?.tagline || ''}
                              onChange={(e) => handleInputChange('manifesto.tagline', e.target.value)}
                              placeholder="e.g., Opportunity, Development & Justice"
                            />
                          ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                              {userData.manifesto?.tagline || <span className="text-muted-foreground italic">Not provided</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Vision Points</Label>
                        {isEditing ? (
                          <div className="space-y-3">
                            {(formData.manifesto?.vision?.points || []).map((point, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  value={point}
                                  onChange={(e) => updateArrayItem('manifesto.vision.points', index, e.target.value)}
                                  placeholder="Vision point..."
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removeArrayItem('manifesto.vision.points', index)}
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => addArrayItem('manifesto.vision.points', '')}
                              className="w-full"
                            >
                              <FiPlus className="h-4 w-4 mr-2" />
                              Add Vision Point
                            </Button>
                          </div>
                        ) : (
                          <div className="min-h-[100px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                            {userData.manifesto?.vision?.points?.length > 0 ? (
                              <ul className="space-y-2">
                                {userData.manifesto.vision.points.map((point, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-muted-foreground italic">No vision points added</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="commitment">Commitment Statement</Label>
                        {isEditing ? (
                          <Textarea
                            id="commitment"
                            value={formData.manifesto?.commitment || ''}
                            onChange={(e) => handleInputChange('manifesto.commitment', e.target.value)}
                            placeholder="Your commitment to the people..."
                            rows={4}
                          />
                        ) : (
                          <div className="min-h-[100px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                            {userData.manifesto?.commitment || <span className="text-muted-foreground italic">Not provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="manifestoStatus">Status</Label>
                          {isEditing ? (
                            <select
                              id="manifestoStatus"
                              value={formData.manifesto?.status || 'draft'}
                              onChange={(e) => handleInputChange('manifesto.status', e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                              <option value="archived">Archived</option>
                            </select>
                          ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                              <Badge variant={userData.manifesto?.status === 'published' ? 'default' : 'secondary'}>
                                {userData.manifesto?.status || 'draft'}
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="publishedDate">Published Date</Label>
                          {isEditing ? (
                            <Input
                              id="publishedDate"
                              type="date"
                              value={formData.manifesto?.publishedDate || ''}
                              onChange={(e) => handleInputChange('manifesto.publishedDate', e.target.value)}
                            />
                          ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                              {userData.manifesto?.publishedDate ? new Date(userData.manifesto.publishedDate).toLocaleDateString() : <span className="text-muted-foreground italic">Not published</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent> */}

                {/* Contact Tab */}
                {/* <TabsContent value="contact">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FiLink className="h-5 w-5" />
                        Contact & Social Media
                      </CardTitle>
                      <CardDescription>
                        Your contact information and social media links
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Contact Information</h3>

                        <div className="space-y-2">
                          <Label htmlFor="addressLine1">Address Line 1</Label>
                          {isEditing ? (
                            <Input
                              id="addressLine1"
                              value={formData.contact?.address?.line1 || ''}
                              onChange={(e) => handleInputChange('contact.address.line1', e.target.value)}
                              placeholder="Office address line 1"
                            />
                          ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                              {userData.contact?.address?.line1 || <span className="text-muted-foreground italic">Not provided</span>}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="addressLine2">Address Line 2</Label>
                          {isEditing ? (
                            <Input
                              id="addressLine2"
                              value={formData.contact?.address?.line2 || ''}
                              onChange={(e) => handleInputChange('contact.address.line2', e.target.value)}
                              placeholder="City, Country"
                            />
                          ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                              {userData.contact?.address?.line2 || <span className="text-muted-foreground italic">Not provided</span>}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="contactPhone">Contact Phone</Label>
                            {isEditing ? (
                              <Input
                                id="contactPhone"
                                type="tel"
                                value={formData.contact?.phone || ''}
                                onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                                placeholder="+880 1711 000000"
                              />
                            ) : (
                              <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                                {userData.contact?.phone || <span className="text-muted-foreground italic">Not provided</span>}
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="contactEmail">Contact Email</Label>
                            {isEditing ? (
                              <Input
                                id="contactEmail"
                                type="email"
                                value={formData.contact?.email || ''}
                                onChange={(e) => handleInputChange('contact.email', e.target.value)}
                                placeholder="office@example.com"
                              />
                            ) : (
                              <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                                {userData.contact?.email || <span className="text-muted-foreground italic">Not provided</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-6 space-y-4">
                        <h3 className="text-lg font-semibold">Social Media Links</h3>

                        {socialMediaPlatforms.map((platform) => {
                          const Icon = platform.icon;
                          return (
                            <div key={platform.id} className="space-y-2">
                              <Label htmlFor={platform.id} className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${platform.color}`} />
                                {platform.label}
                              </Label>
                              {isEditing ? (
                                <Input
                                  id={platform.id}
                                  type="url"
                                  value={formData.socialMedia?.[platform.id] || ''}
                                  onChange={(e) => handleInputChange(`socialMedia.${platform.id}`, e.target.value)}
                                  placeholder={`https://${platform.id}.com/yourprofile`}
                                />
                              ) : (
                                <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                                  {userData.socialMedia?.[platform.id] ? (
                                    <a
                                      href={userData.socialMedia[platform.id]}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline truncate"
                                    >
                                      {userData.socialMedia[platform.id]}
                                    </a>
                                  ) : (
                                    <span className="text-muted-foreground italic">Not connected</span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        <div className="space-y-2">
                          <Label htmlFor="website" className="flex items-center gap-2">
                            <FiGlobe className="h-4 w-4 text-green-600" />
                            Website
                          </Label>
                          {isEditing ? (
                            <Input
                              id="website"
                              type="url"
                              value={formData.socialMedia?.website || ''}
                              onChange={(e) => handleInputChange('socialMedia.website', e.target.value)}
                              placeholder="https://your-website.com"
                            />
                          ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                              {userData.socialMedia?.website ? (
                                <a
                                  href={userData.socialMedia.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline truncate"
                                >
                                  {userData.socialMedia.website}
                                </a>
                              ) : (
                                <span className="text-muted-foreground italic">Not provided</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent> */}

                {/* Party Tab */}
                {/* <TabsContent value="party">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FiUsers className="h-5 w-5" />
                        Political Party Information
                      </CardTitle>
                      <CardDescription>
                        Your political party affiliation and details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="partyName">Party Name</Label>
                        {isEditing ? (
                          <Input
                            id="partyName"
                            value={formData.party?.name || ''}
                            onChange={(e) => handleInputChange('party.name', e.target.value)}
                            placeholder="e.g., Bangladesh Nationalist Party"
                          />
                        ) : (
                          <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                            {userData.party?.name || <span className="text-muted-foreground italic">Not provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="partyAbbreviation">Party Abbreviation</Label>
                        {isEditing ? (
                          <Input
                            id="partyAbbreviation"
                            value={formData.party?.abbreviation || ''}
                            onChange={(e) => handleInputChange('party.abbreviation', e.target.value)}
                            placeholder="e.g., BNP"
                          />
                        ) : (
                          <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                            {userData.party?.abbreviation || <span className="text-muted-foreground italic">Not provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="partyDescription">Party Description</Label>
                        {isEditing ? (
                          <Textarea
                            id="partyDescription"
                            value={formData.party?.description || ''}
                            onChange={(e) => handleInputChange('party.description', e.target.value)}
                            placeholder="Brief description of your party..."
                            rows={4}
                          />
                        ) : (
                          <div className="min-h-[100px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                            {userData.party?.description || <span className="text-muted-foreground italic">Not provided</span>}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent> */}
              </Tabs>
            </div>
          </div>
        </div>
      </DefaultLayout>
    </ProtectedRoute>
  );
};

export default ProfilePage;
