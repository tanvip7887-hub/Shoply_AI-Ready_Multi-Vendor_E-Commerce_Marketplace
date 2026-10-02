import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import { uploadBufferToCloudinary } from "../../utils/cloudinaryUpload.util.js";
import * as applicationService from "./seller_application.service.js";

export const saveDraft = asyncHandler(async (req, res) => {
    const application = await applicationService.saveDraft(req.user.id, req.body);
    sendSuccess(res, { message: "Draft saved", data: application });
});

export const submit = asyncHandler(async (req, res) => {
    const application = await applicationService.submitApplication(req.user.id, req.body);
    sendSuccess(res, { message: "Application submitted for review", data: application });
});

export const getMine = asyncHandler(async (req, res) => {
    const application = await applicationService.getMyApplication(req.user.id);
    sendSuccess(res, { message: "Application fetched", data: application });
});

export const uploadDocument = asyncHandler(async (req, res) => {
    if (!req.file) {
        const err = new Error("No file provided");
        err.statusCode = 400;
        throw err;
    }
    const result = await uploadBufferToCloudinary(req.file.buffer, "meesho_clone/seller_documents");
    const document = await applicationService.addDocument(req.user.id, req.body.type, result.secure_url);
    sendSuccess(res, { statusCode: 201, message: "Document uploaded", data: document });
});