import { useEffect } from "react";

/**
 * Custom hook to set the document title dynamically
 * @param title - The title to set (will be appended to "WorkStack - ")
 * @param suffix - Optional suffix to add after the title
 */
export function useDocumentTitle(title: string, suffix?: string) {
    useEffect(() => {
        const fullTitle = suffix
            ? `WorkStack - ${title} | ${suffix}`
            : `WorkStack - ${title}`;
        document.title = fullTitle;

        // Update meta description if needed
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            // You can customize this based on the page
            metaDescription.setAttribute(
                "content",
                `WorkStack - ${title}. Organize your projects, manage tasks, and collaborate with your team.`
            );
        }

        return () => {
            // Reset to default title on unmount
            document.title = "WorkStack - Project Management Made Simple";
        };
    }, [title, suffix]);
}

