export const fileFieldValidation = {
    image: ['image/png', 'image/jpeg', 'image/gif'],
    video: ['video/mp4', 'video/mkv', 'video/avi'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    pdf: ['application/pdf']

}

export const fileFilter = (validation = []) => {
    return (req, file, cb) => {
        if (!validation.includes(file.mimetype)) {
            cb(new Error('Invalid file Format', { cause: { statusCode: 400 } }), false)
        }
        cb(null, true)

    }
}