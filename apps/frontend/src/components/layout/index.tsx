import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { useState } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { CommandPalette } from "@/components/CommandPalette";

const Layout = () => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden w-full">
            <Sidebar
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNav onMobileMenuClick={() => setIsMobileSidebarOpen(true)} />
                <main className="flex-1 overflow-hidden">
                    <Outlet />
                </main>
            </div>
            <CommandPalette />
        </div>
    )
}

export default Layout;