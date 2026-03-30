import cloudinary from "../Utils/multer/cloudinary.js"

export const uploadFile = async ({ filePath, folder }) => {
    return await cloudinary.uploader.upload(filePath, { folder })
}
export const deleteFile = async (public_id) => {
    return await cloudinary.uploader.destroy(public_id)
}

export const uploadFiles = async ({ files = [], folder }) => {
    let attachments = []
    for (const file of files) {
        const { public_id, secure_url } = await uploadFile({ filePath: file.path, folder })
        attachments.push({ public_id, secure_url })
    }
    return attachments
}
export const deleteFilesWithPublicIds = async (public_ids) => {
    return await cloudinary.api.delete_resources(public_ids)
}

//delete assets folder not folder
export const deleteFolderAssets = async (folder) => {
    return await cloudinary.api.delete_resources_by_prefix(folder)
}
//delete folder
export const deleteFolder = async (folder) => {
    return await cloudinary.api.delete_folder(folder)
}