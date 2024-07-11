import React from 'react'
import HeaderNavbar from '../HeaderNavbar'
import { Sidebar } from '../Sidebar'

interface LayoutWithSidebarProps {
    children: React.ReactNode
}

const LayoutWithSidebar: React.FC<LayoutWithSidebarProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false)

    return (
        <main className="flex h-screen flex-col">
            <HeaderNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    open={sidebarOpen}
                    setOpen={function (open: boolean): void {
                        setSidebarOpen(open)
                    }}
                />
                <div className="flex-1 overflow-auto">{children}</div>
            </div>
        </main>
    )
}

export default LayoutWithSidebar
