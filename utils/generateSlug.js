const generateSlug = (text) => {
    if (!text) return "";
    return text
        .toString()
        .toLowerCase()
        .trim()
        // Replace Vietnamese characters
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/đ/g, "d").replace(/Đ/g, "d")
        // Remove non-alphanumeric characters except spaces and hyphens
        .replace(/[^\w\s-]/g, "")
        // Replace spaces and multiple hyphens with a single hyphen
        .replace(/[\s_]+/g, "-")
        .replace(/--+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
};

module.exports = generateSlug;