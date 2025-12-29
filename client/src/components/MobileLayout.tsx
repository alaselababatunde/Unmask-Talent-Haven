import { ReactNode } from 'react';
import Navbar from './Navbar';

interface MobileLayoutProps {
    children: ReactNode;
    header?: ReactNode;
    showNav?: boolean;
}

const MobileLayout = ({ children, header, showNav = true }: MobileLayoutProps) => {
    return (
        <div className="flex flex-col h-[100dvh] w-full bg-black overflow-hidden relative">
            {/* Header Slot - Fixed height determined by content */}
            {header && (
                <div className="flex-none z-50 w-full relative">
                    {header}
                </div>
            )}

            {/* Main Content - Flex 1 to take remaining space */}
            <main className="flex-1 relative w-full overflow-hidden">
                {children}
            </main>

            {/* Bottom Dock Slot - Fixed at bottom, consumes space */}
            {showNav && (
                <div className="flex-none z-50 w-full bg-black pb-[env(safe-area-inset-bottom)] border-t border-white/10">
                    <Navbar />
                </div>
            )}
        </div>
    );
};

export default MobileLayout;
