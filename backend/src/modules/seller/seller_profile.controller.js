import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as profileService from "./seller_profile.service.js";
import { uploadBufferToCloudinary } from "../../utils/cloudinaryUpload.util.js";

export const getProfile = asyncHandler(async (req, res) => {
    const profile = await profileService.getMyProfile(req.user.id);
    sendSuccess(res, { message: "Profile fetched", data: profile });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const profile = await profileService.updateMyProfile(req.user.id, req.body);
    sendSuccess(res, { message: "Profile updated", data: profile });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        const err = new Error("No image file provided");
        err.statusCode = 400;
        throw err;
    }
    const result = await uploadBufferToCloudinary(req.file.buffer, "meesho_clone/seller_avatars");
    const profile = await profileService.updateMyAvatar(req.user.id, result.secure_url);
    sendSuccess(res, { message: "Profile picture updated", data: profile });
});