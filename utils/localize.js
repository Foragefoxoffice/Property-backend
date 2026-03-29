/**
 * Get a localized message based on the Accept-Language header
 * @param {string} key - The key for the message (e.g., 'updated_successfully')
 * @param {string} lang - The language code (e.g., 'vi', 'en')
 * @returns {string} The localized message
 */
const getLocalizedMessage = (key, lang = 'en') => {
    const messages = {
        updated_successfully: {
            en: 'Updated successfully',
            vi: 'Cập nhật thành công'
        },
        created_successfully: {
            en: 'Created successfully',
            vi: 'Tạo thành công'
        },
        deleted_successfully: {
            en: 'Deleted successfully',
            vi: 'Xóa thành công'
        },
        not_found: {
            en: 'Not found',
            vi: 'Không tìm thấy'
        },
        already_exists: {
            en: 'Already exists',
            vi: 'Đã tồn tại'
        },
        failed_to_fetch: {
            en: 'Failed to fetch',
            vi: 'Tải dữ liệu thất bại'
        },
        failed_to_create: {
            en: 'Failed to create',
            vi: 'Tạo thất bại'
        },
        failed_to_update: {
            en: 'Failed to update',
            vi: 'Cập nhật thất bại'
        },
        file_uploaded: {
            en: 'File uploaded successfully',
            vi: 'Tải lên tập tin thành công'
        },
        no_file_uploaded: {
            en: 'No file uploaded',
            vi: 'Không có tập tin nào được tải lên'
        },
        invalid_file_type: {
            en: 'Invalid file type',
            vi: 'Loại tập tin không hợp lệ'
        },
        file_too_large: {
            en: 'File size too large',
            vi: 'Kích thước tập tin quá lớn'
        }
    };

    const isVi = lang === 'vi';
    const messageSet = messages[key] || { en: key, vi: key };
    
    return isVi ? messageSet.vi : messageSet.en;
};

module.exports = { getLocalizedMessage };
