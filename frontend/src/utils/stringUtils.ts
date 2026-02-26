export const getInitials = (name?: string) => {
    if (!name) return "?";
    
    const cleanName = name.trim();
    
    if (cleanName.includes('@')) {
        return cleanName.substring(0, 2).toUpperCase();
    }
    
    const words = cleanName.split(/[\s_-]+/);
    
    if (words.length >= 2) {
        return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    
    return cleanName.substring(0, 2).toUpperCase();
};