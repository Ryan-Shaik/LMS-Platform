"use server";

import { currentUser } from "@clerk/nextjs/server";
import { UserModel } from "@/models/User";
import { User, UserProfile, UserPreferences, ApiResponse } from "@/models/types";

const userModel = new UserModel();

export async function getCurrentUser(): Promise<ApiResponse<User>> {
try {
const user = await currentUser();

if (!user) {
return { success: false, error: "User not authenticated" };
}

const dbUser = await userModel.getUserByClerkId(user.id);

if (!dbUser) {
return { success: false, error: "User not found" };
}

return { success: true, data: dbUser };
} catch (error) {
console.error("Error getting current user:", error);
return { success: false, error: "Failed to get current user" };
}
}

export async function createOrUpdateUser(): Promise<ApiResponse<User>> {
try {
const clerkUser = await currentUser();

if (!clerkUser) {
return { success: false, error: "User not authenticated" };
}

// Check if user already exists
let user = await userModel.getUserByClerkId(clerkUser.id);

if (!user) {
// Create new user
const userData = {
clerkId: clerkUser.id,
email: clerkUser.emailAddresses[0]?.emailAddress || "",
name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
image: clerkUser.imageUrl,
};

user = await userModel.createUser(userData);

if (!user) {
return { success: false, error: "Failed to create user" };
}

// Create default user profile
const defaultPreferences: UserPreferences = {
theme: 'light',
language: 'en',
notifications: true,
voicePreference: 'female',
stylePreference: 'casual'
};

await userModel.createUserProfile({
userId: user.id,
preferences: defaultPreferences
});
}

return { success: true, data: user };
} catch (error) {
console.error("Error creating/updating user:", error);
return { success: false, error: "Failed to create or update user" };
}
}

export async function getUserProfile(userId?: string): Promise<ApiResponse<UserProfile>> {
try {
let targetUserId = userId;

if (!targetUserId) {
const user = await currentUser();
if (!user) {
return { success: false, error: "User not authenticated" };
}

const dbUser = await userModel.getUserByClerkId(user.id);
if (!dbUser) {
return { success: false, error: "User not found" };
}

targetUserId = dbUser.id;
}

const profile = await userModel.getUserProfile(targetUserId);

if (!profile) {
return { success: false, error: "Profile not found" };
}

return { success: true, data: profile };
} catch (error) {
console.error("Error getting user profile:", error);
return { success: false, error: "Failed to get user profile" };
}
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
try {
const user = await currentUser();

if (!user) {
return { success: false, error: "User not authenticated" };
}

const dbUser = await userModel.getUserByClerkId(user.id);

if (!dbUser) {
return { success: false, error: "User not found" };
}

const updatedProfile = await userModel.updateUserProfile(dbUser.id, updates);

if (!updatedProfile) {
return { success: false, error: "Failed to update profile" };
}

return { success: true, data: updatedProfile, message: "Profile updated successfully" };
} catch (error) {
console.error("Error updating user profile:", error);
return { success: false, error: "Failed to update user profile" };
}
}

export async function updateUserPreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<UserProfile>> {
try {
const user = await currentUser();

if (!user) {
return { success: false, error: "User not authenticated" };
}

const dbUser = await userModel.getUserByClerkId(user.id);

if (!dbUser) {
return { success: false, error: "User not found" };
}

const currentProfile = await userModel.getUserProfile(dbUser.id);

if (!currentProfile) {
return { success: false, error: "Profile not found" };
}

const updatedPreferences = {
...currentProfile.preferences,
...preferences
};

const updatedProfile = await userModel.updateUserProfile(dbUser.id, {
preferences: updatedPreferences
});

if (!updatedProfile) {
return { success: false, error: "Failed to update preferences" };
}

return { success: true, data: updatedProfile, message: "Preferences updated successfully" };
} catch (error) {
console.error("Error updating user preferences:", error);
return { success: false, error: "Failed to update user preferences" };
}
}